const moment = require('moment');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const secret = 'nvnit395nwvs9dtnet3925ascasl9';
class AppointmentController {
    // [GET] /appointments : Get all appointments
    async index(req, res, next) {
        let events = null;
        if (Object.keys(req.query).length === 0) {
            events = await Appointment.find();
        } else {
            events = await Appointment.find({
                start: { $gte: moment(req.query.start).toDate() },
                end: { $lte: moment(req.query.end).toDate() },
            });
        }
        return res.json(events);
    }
    // [GET] /appointments/:id : Get a appointments
    show(req, res, next) {}

    //[POST] /appointments : Create a new appointment
    async create(req, res, next) {
        try {
            // Lấy token từ cookie
            const { token } = req.cookies;

            if (!token) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Xác thực token và lấy thông tin người dùng
            const decoded = await jwt.verify(token, secret);
            const { id: doctor_id } = decoded;

            //Xác thực số điện thoại bệnh nhân, lưu id bệnh nhân
            const phone_number = req.body.patientPhone;
            const patientInfo = await User.findOne({ phone_number });
            if (!patientInfo || patientInfo.is_doctor) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            // Tạo sự kiện và lưu vào cơ sở dữ liệu
            const event = new Appointment(req.body);
            event.doctor = doctor_id; // Gán ID của người dùng cho trường author của sự kiện
            event.patient = patientInfo._id;
            const createdEvent = await event.save();
            res.json(createdEvent);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    //[DELETE] /appointments/:id : Delete
    delete(req, res, next) {
        Appointment.findByIdAndDelete(req.params.id)
            .then((response) => {
                res.json('success');
            })
            .catch((error) => {
                console.error('Error creating event:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    //[PUT] /appointments/:id   : Update an existing appointment
    update(req, res, next) {
        if (req.params.id) {
            Appointment.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
            })
                .then((updatedData) => {
                    return res.json(updatedData);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new AppointmentController();
