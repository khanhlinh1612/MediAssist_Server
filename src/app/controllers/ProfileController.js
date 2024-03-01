const User = require('../models/User');
const jwt = require('jsonwebtoken');
const secret = 'nvnit395nwvs9dtnet3925ascasl9';

class ProfileController {
    //[GET] /profile/:id
    show(req, res) {
        const { token } = req.cookies;
        if (token !== undefined && token !== '') {
            jwt.verify(token, secret, {}, (err, info) => {
                if (err) {
                    console.error('Error verifying token:', err);
                    return res.status(401).json({ error: 'Unauthorized' });
                } else {
                    const { phone_number } = info; // Lấy phone_number từ info
                    User.findOne({ phone_number })
                        .then((user) => {
                            if (!user) {
                                return res
                                    .status(404)
                                    .json({ error: 'User not found' });
                            }
                            const userInfo = {
                                ...info,
                                avatar: user.avatar,
                                first_name: user.first_name,
                                last_name: user.last_name,
                            }; // Thêm thông tin avatar từ user
                            return res.json({ ...userInfo, status: 'valid' });
                        })
                        .catch((err) => {
                            console.error('Error finding user:', err);
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
}

module.exports = new ProfileController();
