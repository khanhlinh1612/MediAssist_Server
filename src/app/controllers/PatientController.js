const moment = require('moment');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const calculateAgeAndSeparateName = function ({ fullname, birthday }) {
    let first_name = '';
    let last_name = '';
    let age = '';
    if (fullname) {
        const names = fullname.split(' ');
        first_name = names[0];
        last_name = names[names.length - 1];
    }
    if (birthday) {
        const today = new Date();
        const birthDate = new Date(birthday);
        age = today.getFullYear() - birthDate.getFullYear();
    }
    return { first_name, last_name, age };
};
class PatientController {
    // [GET] /patients : Get all patients
    async index(req, res, next) {
        const patients = await User.find({ is_doctor: false });
        res.json(patients);
    }
    // [GET] /patients/:id : Get a patients
    async show(req, res, next) {
        const patient = await User.findOne({ _id: req.params.id });
        res.json(patient);
    }

    //[POST] /patients : Create a new appointment
    async create(req, res, next) {
        try {
            console.log(req.body);
            const hashedPassword = bcrypt.hashSync(req.body.password, salt);
            const { first_name, last_name, age } = calculateAgeAndSeparateName(
                req.body,
            );
            const patient = {
                fullname: req.body.fullname,
                gender: req.body.gender,
                birthday: req.body.birthday,
                phone_number: req.body.phone_number,
                password: hashedPassword,
                idNumber: req.body.idNumber,
                address: req.body.address,
                first_name: first_name,
                last_name: last_name,
                age: age,
                is_doctor: false,
            };
            const response = await User.create(patient);
            res.json(response);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json(error);
        }
    }

    //[DELETE] /patients/:id : Delete
    delete(req, res, next) {
        User.findByIdAndDelete(req.params.id)
            .then((response) => {
                console.log(response);
                res.json('success');
            })
            .catch((error) => {
                console.error('Error creating event:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    //[PUT] /patients/:id   : Update an existing appointment
    async update(req, res, next) {
        try {
            const { first_name, last_name, age } = calculateAgeAndSeparateName(
                req.body,
            );
            const data = {
                ...req.body,
                first_name,
                last_name,
                age,
            };
            console.log('This is data', data);
            const updatedData = await User.findOneAndUpdate(
                { _id: req.params.id },
                data,
                { new: true },
            );

            res.json(updatedData);
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new PatientController();
