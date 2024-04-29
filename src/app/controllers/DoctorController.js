const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const secret = 'nvnit395nwvs9dtnet3925ascasl9';
class SiteController {
    //[POST] /register
    async register(req, res) {
        const { phone_number, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, salt);
        // Tạo một Doctor mới với thông tin đã băm mật khẩu
        Doctor.create({
            phone_number,
            password: hashedPassword, // Sử dụng mật khẩu đã băm
        })
            .then((Doctor) => {
                return res.json(Doctor);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    //[POST] /login
    async login(req, res) {
        try {
            const { phone_number, password } = req.body;
            const DoctorDoc = await Doctor.findOne({ phone_number });
            if (DoctorDoc !== null) {
                const passOk = await bcrypt.compare(
                    password,
                    DoctorDoc.password,
                );
                if (passOk) {
                    //logged in
                    jwt.sign(
                        { phone_number, id: DoctorDoc.id },
                        secret,
                        {},
                        (err, token) => {
                            if (err) {
                                console.error('Error generating token:', err);
                                return res
                                    .status(500)
                                    .json({ error: 'Internal Server Error' });
                            }

                            return res.cookie('token', token).json({
                                id: DoctorDoc.id,
                                first_name: DoctorDoc.first_name,
                                last_name: DoctorDoc.last_name,
                                avatar: DoctorDoc.avatar,
                            });
                        },
                    );
                } else {
                    res.status(401).json({ error: 'Invalid credentials' });
                }
            } else res.status(400).json('Invalid credentials');
        } catch (err) {
            console.error('Login error: ' + err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    //[POST] /logout
    logout(req, res) {
        return res.cookie('token', '').json('ok');
    }

    // [GET] /doctor/:id : Get a doctor
    show(req, res) {
        Doctor.find({ id: req.params.id })
            .then((Doctor) => {
                res.json(Doctor);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }
}
module.exports = new SiteController();
