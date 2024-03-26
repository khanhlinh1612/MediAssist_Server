const MedicalRecord = require('../models/MedicalRecord');

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
            for (let key in data) {
                if (!isNaN(parseFloat(data[key]))) {
                    data[key] = parseFloat(data[key]);
                }
            }
            console.log(data);
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
