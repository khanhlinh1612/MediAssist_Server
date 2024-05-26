const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_SECRET;
const fs = require('fs');
class ProfileController {
    //[GET] /profile
    show = (req, res) => {
        const { token } = req.cookies;
        console.log('Đây là token:', token);

        if (token) {
            jwt.verify(token, secret, (err, info) => {
                if (err) {
                    console.error('Lỗi xác thực token:', err);
                    return res.status(401).json({ error: 'Unauthorized' });
                }

                const { phone_number } = info;
                Doctor.findOne({ phone_number })
                    .then((doctor) => {
                        if (!doctor) {
                            return res
                                .status(404)
                                .json({ error: 'Doctor not found' });
                        }

                        return res.json({ Doctor: doctor, status: 'valid' });
                    })
                    .catch((err) => {
                        console.error('Lỗi tìm kiếm Doctor:', err);
                        return res
                            .status(500)
                            .json({ error: 'Internal Server Error' });
                    });
            });
        } else {
            return res
                .status(400)
                .json({ status: 'invalid', error: 'Invalid token' });
        }
    };

    //[PUT] /profile/:id
    async update(req, res) {
        const { id } = req.params;
        // Check if id is provided
        if (!id) {
            return res.status(400).json({ error: 'Doctor ID is required' });
        }
        const avatar = req.file.path;

        const currentDoctor = await Doctor.findOne({ _id: id });
        const updatedDoctor = req.body;
        updatedDoctor.avatar = avatar ? avatar : currentDoctor.avatar;
        updatedDoctor.password = currentDoctor.password;
        console.log('This is updatedDoctor', updatedDoctor);
        Doctor.findByIdAndUpdate(id, updatedDoctor, { new: true })
            .then((updatedDoctor) => {
                if (!updatedDoctor) {
                    return res.status(404).json({ error: 'Doctor not found' });
                }
                const tokenPayload = {
                    phone_number: updatedDoctor.phone_number,
                    name: updatedDoctor.name,
                };
                const newToken = jwt.sign(tokenPayload, secret, {
                    expiresIn: '1d',
                });
                return res.cookie('token', newToken).json(updatedDoctor);
            })
            .catch((err) => {
                console.error('Error updating Doctor:', err.code);
                if (err.code === 11000) {
                    if (err.keyPattern.phone_number) {
                        return res.status(500).json({
                            error: `Số điện thoại đã tồn tại trong hệ thống.`,
                        });
                    } else if (err.keyPattern.idNumber) {
                        return res.status(500).json({
                            error: `Số căn cước công dân đã tồn tại trong hệ thống.`,
                        });
                    }
                } else
                    return res
                        .status(500)
                        .json({ error: 'Internal Server Error' });
            });
    }
}

module.exports = new ProfileController();
