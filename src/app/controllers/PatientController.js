const User = require('../models/User');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const MedicalRecord = require('../models/MedicalRecord');

const createMedicalRecord = async (age, genderData) => {
    try {
        let gender = 0;
        if (genderData === 'Nữ') {
            gender = 0;
        } else {
            gender = 1;
        }
        const medicalRecord = await MedicalRecord.create({
            age: age,
            gender: gender,
        });
        return medicalRecord._id;
    } catch (error) {
        throw error;
    }
};

const calculateAgeAndSeparateName = function ({ fullname, birthday }) {
    let first_name = '';
    let last_name = '';
    let age = '';
    if (fullname) {
        const names = fullname.split(' ');
        last_name = names[0];
        first_name = names[names.length - 1];
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
        try {
            const patients = await User.find({ is_doctor: false }).sort({
                first_name: 1,
            });
            res.json(patients);
        } catch (error) {
            console.error('Error fetching patients:', error);
            res.status(500).json(error);
        }
    }
    // [GET] /patients/:id : Get a patients
    async show(req, res, next) {
        const patient = await User.findOne({ _id: req.params.id });
        res.json(patient);
    }

    //[POST] /patients : Create a new appointment
    async create(req, res, next) {
        try {
            const hashedPassword = bcrypt.hashSync(req.body.password, salt);
            const { first_name, last_name, age } = calculateAgeAndSeparateName(
                req.body,
            );
            const medicalRecordId = await createMedicalRecord(
                age,
                req.body.gender,
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
                medical_record: medicalRecordId,
            };
            const response = await User.create(patient);
            res.json(response);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json(error);
        }
    }

    names(req, res, next) {
        User.find({}, 'fullname phone_number') // Chỉ lấy trường fullname từ database
            .then((patients) => {
                const fullnames = patients.map((patient) => patient.fullname);
                const phoneNumbers = patients.map((patient) => ({
                    [patient.fullname]: patient.phone_number,
                }));
                console.log(phoneNumbers);
                res.json({ fullnames, phoneNumbers }); // Trả về mảng các fullname
            })
            .catch((error) => {
                console.error('Error fetching names:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    //[DELETE] /patients/:id : Delete
    delete(req, res, next) {
        User.findByIdAndDelete(req.params.id)
            .then((response) => {
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

            if (data.medical_record === undefined) {
                const medicalRecordId = await createMedicalRecord(
                    data.age,
                    req.body.gender,
                );
                data.medical_record = medicalRecordId;
            }

            const updatedData = await User.findOneAndUpdate(
                { _id: req.params.id },
                data,
                { new: true },
            );
            console.log('This is updated Data', updatedData);
            res.json(updatedData);
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json(error);
        }
    }
}

module.exports = new PatientController();
