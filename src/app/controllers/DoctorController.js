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

    //[POST] /login
    // async login(req, res) {
    //     try {
    //         const { phone_number, password } = req.body;
    //         if (!phone_number || !password) {
    //             return res.status(400).json({ error: 'Phone number and password are required' });
    //         }

    //         const DoctorDoc = await Doctor.findOne({ phone_number });
    //         if (DoctorDoc) {
    //             const passOk = await bcrypt.compare(password, DoctorDoc.password);
    //             if (passOk) {
    //                 //logged in
    //                 jwt.sign(
    //                     { phone_number, id: DoctorDoc._id },
    //                     secret,
    //                     {},
    //                     (err, token) => {
    //                         if (err) {
    //                             console.error('Error generating token:', err);
    //                             return res.status(500).json({ error: 'Internal Server Error' });
    //                         }

    //                         Routes.json(
    //                             {
    //                                 userInfo: {
    //                                     id: DoctorDoc._id,
    //                                     first_name: DoctorDoc.first_name,
    //                                     last_name: DoctorDoc.last_name,
    //                                     avatar: DoctorDoc.avatar,
    //                                     },
    //                                 token: token,
    //                             }

    //                     );
    //                     }
    //                 );
    //             } else {
    //                 res.status(401).json({ error: 'Invalid credentials' });
    //             }
    //         } else {
    //             res.status(400).json({ error: 'Invalid credentials' });
    //         }
    //     } catch (err) {
    //         console.error('Login error: ' + err.message);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // }

    //[POST] /logout
    logout(req, res) {
        res.cookie('token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        }).json('ok');
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
