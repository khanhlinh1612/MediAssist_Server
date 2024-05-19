const moment = require('moment');
const History = require('../models/History');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const MedicalService = require('../models/MedicalService');
const Prescription = require('../models/Prescription');
const Invoice = require('../models/Invoice');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_SECRET;
const calTotal = (serviceArray, medicineArray) => {
    let total = 0;
    serviceArray.forEach((service) => {
        total += service.price;
    });
    medicineArray.forEach((medicine) => {
        total += medicine.price * medicine.quantity;
    });
    return total;
};
//handle Medicines Array
const handleMedicines = async (prescription) => {
    let error = '';
    let fixedPrescription = await Promise.all(
        prescription.map(async (drug) => {
            const medicine = await Medicine.findOne({
                name: drug.name,
            });
            if (medicine) {
                return {
                    name: medicine.name,
                    dosage: drug.dosage,
                    quantity: drug.quantity,
                    price: medicine.price,
                };
            } else {
                error = 'Medicine is not available';
            }
        }),
    );
    return { fixedPrescription, error };
};

//handle Service Array
const handleServices = async (services) => {
    let errorService = '';
    let medicalServices = await Promise.all(
        services.map(async (service) => {
            const serviceSystem = await MedicalService.findOne({
                name: service.name,
            });
            if (serviceSystem) {
                return {
                    name: serviceSystem.name,
                    price: serviceSystem.price,
                    quantity: service.quantity,
                };
            } else {
                errorService = 'Service is not available';
            }
        }),
    );
    return { medicalServices, errorService };
};

class HistoryController {
    // [GET] /history : Get all history
    async index(req, res, next) {
        const patient = req.query.patient;
        if (patient) {
            History.find({ patient: patient })
                .sort({ createdAt: 'desc' })
                .then((histories) => {
                    res.json(histories);
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' });
                });
        } else {
            History.find()
                .populate('invoice', [
                    'medicalServices',
                    'medicines',
                    'total',
                    'status',
                ])
                .sort({ createdAt: 'desc' })
                .then((histories) => {
                    res.json(histories);
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' });
                });
        }
    }
    // [GET] /history/:id : Get a history
    show(req, res, next) {
        const historyId = req.params.id;
        if (historyId) {
            History.findById(historyId)
                .populate('prescription', ['drugs'])
                .populate('invoice', [
                    'medicalServices',
                    'medicines',
                    'total',
                    'status',
                ])
                .then((data) => {
                    if (data) {
                        res.json(data);
                    } else {
                        res.status(404).json({ error: 'History not found' });
                    }
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' });
                });
        } else {
            res.status(400).json({ error: 'Invalid historyId' });
        }
    }

    //[POST] /history : Create a new History
    async create(req, res, next) {
        try {
            // Lưu thông tin của bác sĩ
            const { token } = req.cookies;
            if (!token) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const decoded = await jwt.verify(token, secret);
            const { id: doctor_id } = decoded;

            // Xác thực số điện thoại của bệnh nhân và lưu id của bệnh nhân
            const phoneNumber = req.body.phoneNumber.trim();
            const patientInfo = await User.findOne({
                phone_number: phoneNumber,
            });
            if (!patientInfo || patientInfo.is_doctor) {
                return res.status(404).json({ error: 'Patient not found' });
            } else {
                if (patientInfo.fullname.trim() !== req.body.fullname.trim()) {
                    return res
                        .status(403)
                        .json({ error: 'Invalid patient information' });
                }
            }

            // Tạo và lưu thực thể prescription
            let prescription = req.body.prescription;
            let error = '';
            if (Array.isArray(prescription)) {
                if (prescription.length === 0) {
                    prescription = [];
                } else {
                    const result = await handleMedicines(prescription);
                    prescription = result.fixedPrescription;
                    error = result.error;
                }
            } else {
                error = 'Invalid Prescription';
            }

            if (error) {
                return res.status(500).json({ error });
            }

            // Tạo và lưu thực thể Service
            let medicalServices = req.body.service;
            let errorService = '';
            if (Array.isArray(medicalServices)) {
                if (medicalServices.length === 0) {
                    medicalServices = [];
                } else {
                    const result = await handleServices(medicalServices);
                    medicalServices = result.medicalServices;
                    errorService = result.errorService;
                }
            } else {
                errorService = 'Invalid Service';
            }

            if (errorService) {
                return res.status(500).json({ error: errorService });
            }
            //Tạo thực thể Invoice
            let total = calTotal(medicalServices, prescription);
            let invoiceMedicines = prescription.map((medicine) => ({
                name: medicine.name,
                dosage: medicine.dosage,
                quantity: medicine.quantity,
                price: medicine.price,
            }));
            let status = total > 0 ? 'unpaid' : 'paid';
            let invoice = {
                total: total,
                medicines: invoiceMedicines, // Sử dụng mảng vừa tạo
                medicalServices: medicalServices,
                patient: patientInfo._id,
                status: status,
            };
            const createdPrescription = await Prescription.create({
                drugs: prescription,
            });
            const createdInvoice = await Invoice.create(invoice);
            // Tạo lịch sử thăm khám và lưu vào cơ sở dữ liệu
            const history = {
                ...req.body,
                invoice: createdInvoice._id,
                prescription: createdPrescription._id,
                doctor: doctor_id,
                phoneNumber,
                fullname: req.body.fullname.trim(),
                patient: patientInfo._id,
            };
            const createdHistory = await History.create(history);

            // Lưu history vào cho thông tin bệnh nhân
            let newHistories = [...patientInfo.histories, createdHistory._id];
            patientInfo.histories = newHistories;
            await patientInfo.save();

            return res.json(createdHistory);
        } catch (error) {
            console.error('Error creating event:', error);
            return res
                .status(500)
                .json({ error: 'Failed create medical appointment history' });
        }
    }

    //[DELETE] /history/:id : Delete
    delete(req, res, next) {
        History.findByIdAndDelete(req.params.id)
            .then((response) => {
                res.json('success');
            })
            .catch((error) => {
                console.error('Error creating event:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    async services(req, res) {
        MedicalService.find({}, 'name')
            .then((services) => {
                const serviceNames = services.map((service) => service.name);
                console.log(serviceNames);
                res.json(serviceNames);
            })
            .catch((error) => {
                console.error('Error fetching names:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    async drugs(req, res) {
        Medicine.find({}, 'name')
            .then((medicines) => {
                const medicineNames = medicines.map(
                    (medicine) => medicine.name,
                );
                console.log(medicineNames);
                res.json(medicineNames);
            })
            .catch((error) => {
                console.error('Error fetching names:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    //[PUT] /history/:id   : Update an existing History
    async update(req, res, next) {
        try {
            let error = '';
            const history = await History.findById(req.params.id);
            if (!history) {
                console.error('Không tìm thấy lịch sử khám bệnh');
                return res
                    .status(404)
                    .json({ error: 'Không tìm thấy lịch sử khám bệnh' });
            }
            //Update Prescription
            const prescriptionId = history.prescription;
            const dataPrescription = await handleMedicines(
                req.body.prescription,
            );
            let updatedPrescription = null;
            if (dataPrescription.error === '') {
                updatedPrescription = await Prescription.findByIdAndUpdate(
                    prescriptionId,
                    { drugs: dataPrescription.fixedPrescription },
                    { new: true },
                );
            } else {
                return res.status(500).json({ error: dataPrescription.error });
            }

            //Update Invoice
            const invoiceId = history.invoice;
            const drugs = updatedPrescription.drugs;
            const dataServices = await handleServices(req.body.service);
            let updatedServices = null;

            if (dataServices.errorService === '') {
                updatedServices = dataServices.medicalServices;
            } else {
                console.log(dataServices.errorService);
                return res
                    .status(500)
                    .json({ error: dataServices.errorService });
            }

            let total = calTotal(updatedServices, drugs);
            const updatedInvoice = await Invoice.findByIdAndUpdate(
                invoiceId,
                {
                    medicalServices: updatedServices,
                    medicines: drugs,
                    total: total,
                },
                { new: true },
            );

            console.log('This is updated Invoice', updatedInvoice);

            let historyData = req.body;
            historyData.prescription = updatedPrescription._id;
            historyData.invoice = updatedInvoice._id;
            const updatedHistory = await History.findByIdAndUpdate(
                historyData._id,
                historyData,
                { new: true },
            );
            console.log('This is updated history', updatedHistory);
            res.status(200).json({ message: 'Cập nhật thành công' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật' });
        }
    }
}

module.exports = new HistoryController();
