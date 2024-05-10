const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const secret = 'nvnit395nwvs9dtnet3925ascasl9';
const fs = require('fs');
class ProfileController {
    //[GET] /profile
    show(req, res) {
        const { token } = req.cookies;
        if (token !== undefined && token !== '') {
            jwt.verify(token, secret, {}, (err, info) => {
                if (err) {
                    console.error('Error verifying token:', err);
                    return res.status(401).json({ error: 'Unauthorized' });
                } else {
                    const { phone_number } = info;
                    Doctor.findOne({ phone_number })
                        .then((Doctor) => {
                            if (!Doctor) {
                                return res
                                    .status(404)
                                    .json({ error: 'Doctor not found' });
                            }

                            return res.json({ Doctor, status: 'valid' });
                        })
                        .catch((err) => {
                            console.error('Error finding Doctor:', err);
                            return res
                                .status(500)
                                .json({ error: 'Internal Server Error' });
                        });
                }
            });
        } else {
            return res.json({
                status: 'invalid',
            });
        }
    }

    //[PUT] /profile/:id
    async update(req, res) {
        const { id } = req.params;
        // Check if id is provided
        if (!id) {
            return res.status(400).json({ error: 'Doctor ID is required' });
        }

        let newPath = null;
        if (req.file) {
            const { originalname, path } = req.file;
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1];
            newPath = path + '.' + ext;
            fs.renameSync(path, newPath);
        }

        const currentDoctor = await Doctor.findOne({ _id: id });
        const updatedDoctor = req.body;
        updatedDoctor.avatar = newPath ? newPath : currentDoctor.avatar;
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
