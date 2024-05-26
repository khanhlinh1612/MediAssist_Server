const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const salt = bcrypt.genSaltSync(10);
require('dotenv').config();
const secret = process.env.JWT_SECRET;
class SiteController {
    //[POST] /register
    async register(req, res) {
        try {
            const { phone_number, password } = req.body;
            if (!phone_number || !password) {
                return res
                    .status(400)
                    .json({ error: 'Phone number and password are required' });
            }

            const hashedPassword = bcrypt.hashSync(password, salt);
            const newDoctor = await Doctor.create({
                phone_number,
                password: hashedPassword,
            });

            res.json(newDoctor);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // [GET] /doctor/:id : Get a doctor
    async show(req, res) {
        try {
            const doctor = await Doctor.findById(req.params.id);
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found' });
            }
            res.json(doctor);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new SiteController();
