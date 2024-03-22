const moment = require('moment');
const History = require('../models/History');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const MedicalService = require('../models/MedicalService');
const Prescription = require('../models/Prescription');
const Invoice = require('../models/Invoice');
const jwt = require('jsonwebtoken');
const secret = 'nvnit395nwvs9dtnet3925ascasl9';
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
    show(req, res, next) {}

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
                    prescription = await Promise.all(
                        prescription.map(async (drug) => {
                            const medicine = await Medicine.findOne({
                                name: drug.name,
                            });
                            if (medicine) {
                                return {
                                    medicine: medicine._id,
                                    dosage: drug.dosage,
                                    quantity: drug.quantity,
                                    price: medicine.price,
                                };
                            } else {
                                error = 'Medicine is not available';
                            }
                        }),
                    );
                }
            } else {
                error = 'Invalid Prescription';
            }

            if (error) {
                return res.status(500).json({ error });
            }

            const createdPrescription = await Prescription.create({
                drugs: prescription,
            });

            // Tạo và lưu thực thể Service
            let medicalServices = req.body.service;
            let errorService = '';
            if (Array.isArray(medicalServices)) {
                if (medicalServices.length === 0) {
                    medicalServices = [];
                } else {
                    medicalServices = await Promise.all(
                        medicalServices.map(async (service) => {
                            const serviceSystem = await MedicalService.findOne({
                                name: service.name,
                            });
                            if (serviceSystem) {
                                return {
                                    service: serviceSystem._id,
                                    name: serviceSystem.name,
                                    price: serviceSystem.price,
                                };
                            } else {
                                errorService = 'Service is not available';
                            }
                        }),
                    );
                }
            } else {
                errorService = 'Invalid Service';
            }

            if (errorService) {
                return res.status(500).json({ error: errorInvoice });
            }
            //Tạo thực thể Invoice
            let total = calTotal(medicalServices, prescription);
            console.log('This is MedicalServices', medicalServices);
            console.log('Total', total);
            let invoice = {
                total: total,
                medicines: prescription,
                medicalServices: medicalServices,
                patient: patientInfo._id,
            };
            console.log('This is invoice', invoice);
            const createdInvoice = await Invoice.create(invoice);
            console.log('This is invoice after created', createdInvoice);
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
                // res.json(response);
            })
            .catch((error) => {
                console.error('Error creating event:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    //[PUT] /history/:id   : Update an existing History
    update(req, res, next) {
        History.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .then((updatedData) => {
                res.json(updatedData);
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

module.exports = new HistoryController();
