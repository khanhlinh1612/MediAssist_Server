const moment = require('moment');
const History = require('../models/History');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const MedicalService = require('../models/MedicalService');
class PrescriptionController {
    // [GET] /history : Get all history
    async index(req, res, next) {
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
    // [GET] /history/:id : Get a history
    show(req, res, next) {}

    //[POST] /history : Create a new History
    async create(req, res, next) {
        try {
            // Save information of doctor
            const { token } = req.cookies;
            if (!token) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const decoded = await jwt.verify(token, secret);
            const { id: doctor_id } = decoded;

            //Xác thực số điện thoại bệnh nhân, lưu id bệnh nhân
            const phoneNumber = req.body.phoneNumber.trim();
            const patientInfo = await User.findOne({
                phone_number: phoneNumber,
            });
            if (!patientInfo || patientInfo.is_doctor) {
                return res.status(404).json({ error: 'Patient not found' });
            } else {
                patientInfo.fullname = patientInfo.fullname.trim();
                let dataFullname = req.body.fullname.trim();
                if (patientInfo.fullname !== dataFullname) {
                    console.log(
                        'This is patient: ',
                        patientInfo.fullname,
                        req.body.fullname,
                    );
                    return res
                        .status(403)
                        .json({ error: 'Invalid patient information' });
                }
            }
            // Lưu thông tin đơn thuốc
            let prescription = req.body.prescription;
            console.log(prescription);
            // Tạo sự kiện và lưu vào cơ sở dữ liệu
            let history = req.body;
            console.log('This is history', history);
            history.invoice = null;
            history.prescription = null;
            history.doctor = doctor_id;
            history.phoneNumber = req.body.phoneNumber.trim();
            history.fullname = req.body.fullname.trim();
            history.patient = patientInfo._id;
            const createdHistory = await History.create(history);
            // console.log(createdHistory);
            res.json(createdHistory);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({
                error: 'Failed create medical appointment history',
            });
        }
    }

    //[DELETE] /history/:id : Delete
    delete(req, res, next) {
        History.findByIdAndDelete(req.params.id)
            .then((response) => {
                console.log(response);
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
        console.log(req.body);
        History.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .then((updatedData) => {
                res.json(updatedData);
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

module.exports = new PrescriptionController();
