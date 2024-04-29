const express = require('express');
const router = express.Router();
const profileController = require('../app/controllers/ProfileController');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
router.get('/', profileController.show);
router.put('/:id', uploadMiddleware.single('file'), profileController.update);
module.exports = router;
