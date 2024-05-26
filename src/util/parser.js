const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Uploads',
        format: async (req, file) => 'png',
        public_id: (req, file) => file.originalname,
    },
});

const parser = multer({ storage: storage });

module.exports = parser;
