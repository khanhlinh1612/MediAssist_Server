const User = require('../models/User');
const {
    multipleMongooseObjectHandlers,
    singleMongooseObjectHandlers,
} = require('../../util/mongoose');
const bcrypt = require('bcrypt');
const { response } = require('express');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const secret = 'nvnit395nwvs9dtnet3925ascasl9';
class SiteController {
    //[POST] /register
    async register(req, res) {
        const { phone_number, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, salt);
        // Tạo một user mới với thông tin đã băm mật khẩu
        User.create({
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
            const userDoc = await User.findOne({ phone_number });
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

                            return res.cookie('token', token).json({
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

    //[GET] /
    index(req, res) {
        User.find({})
            .then((users) => {
                users = multipleMongooseObjectHandlers(users);
                return res.render('home', { users });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }
}
module.exports = new SiteController();
