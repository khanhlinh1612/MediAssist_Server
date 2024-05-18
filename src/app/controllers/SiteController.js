const Doctor = require('../models/Doctor');
const User = require('../models/User');
const History = require('../models/History');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const secret = 'nvnit395nwvs9dtnet3925ascasl9';
class SiteController {
    //[POST] /register
    async register(req, res) {
        const { phone_number, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, salt);
        // Tạo một user mới với thông tin đã băm mật khẩu
        Doctor.create({
            phone_number,
            password: hashedPassword, // Sử dụng mật khẩu đã băm
        })
            .then((user) => {
                return res.json(user);
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
            const userDoc = await Doctor.findOne({ phone_number });
            console.log('Đây là userDoc', userDoc);
            if (userDoc !== null) {
                const passOk = await bcrypt.compare(password, userDoc.password);
                if (passOk) {
                    //logged in
                    jwt.sign(
                        { phone_number, id: userDoc.id },
                        secret,
                        {},
                        (err, token) => {
                            if (err) {
                                console.error('Error generating token:', err);
                                return res
                                    .status(500)
                                    .json({ error: 'Internal Server Error' });
                            }

                            return res
                                .cookie('token', token, {
                                    httpOnly: true,
                                    expires: new Date(Date.now() + 900000),
                                    sameSite: 'none',
                                    secure: true,
                                })
                                .json({
                                    id: userDoc.id,
                                    first_name: userDoc.first_name,
                                    last_name: userDoc.last_name,
                                    avatar: userDoc.avatar,
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

    //[GET] /totalCount
    async totalCount(req, res) {
        try {
            const totalUsers = await User.countDocuments();
            const totalHistories = await History.countDocuments();
            const totalIsHeartAttacked = await User.countDocuments({
                is_heart_attack: true,
            });
            return res.json({
                totalUsers,
                totalHistories,
                totalIsHeartAttacked,
            });
        } catch (err) {
            console.error('Error calculating total count:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
module.exports = new SiteController();
