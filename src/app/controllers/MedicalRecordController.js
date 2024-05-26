const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
class MedicalRecordController {
    // [GET] /posts : Get all posts
    index(req, res) {
        Post.find()
            .populate('author', ['first_name', 'last_name'])
            .sort({ createdAt: 'desc' })
            .limit(10)
            .then((posts) => {
                posts = multipleMongooseObjectHandlers(posts);
                res.json(posts);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    // [POST] /posts : create a new post
    create(req, res, next) {}

    //  [GET] /posts/:id :get a specific post
    show(req, res, next) {
        console.log(
            "There's an api from client to get Medical Record",
            req.params.id,
        );
        MedicalRecord.findById(req.params.id)
            .then((record) => {
                res.json(record);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    // [PUT] /posts/:slug : update a specific post
    async update(req, res, next) {
        try {
            let data = req.body;
            if (data.result !== 2) {
                const is_heart_attack = data.result === 1;
                console.log('This is heart_attack', is_heart_attack);
                try {
                    const record = await User.find({
                        medical_record: req.params.id,
                    });
                    if (record.length > 0) {
                        console.log(
                            'This is heart_attacdádssk',
                            is_heart_attack,
                        );
                        await User.findOneAndUpdate(
                            { _id: record[0]._id },
                            { is_heart_attack: is_heart_attack },
                        );
                    }
                } catch (error) {
                    console.error('Error updating patient record:', error);
                    // Xử lý lỗi hoặc thông báo cho người dùng
                }
            }

            const updatedMedicalRecord = await MedicalRecord.findOneAndUpdate(
                { _id: req.params.id },
                data,
                { new: true },
            );
            console.log(updatedMedicalRecord);
            res.json(updatedMedicalRecord);
        } catch (error) {
            console.error('Error updating medical record:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // [DELETE] /posts/:slug :delete a specific post
    delete(req, res, next) {
        return res.json('deleted');
    }
}

module.exports = new MedicalRecordController();
