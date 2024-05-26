const express = require('express');
const router = express.Router();
const parser = require('../util/parser');
const profileController = require('../app/controllers/ProfileController');
const multer = require('multer');
router.get('/', profileController.show);
router.put('/:id', parser.single('file'), profileController.update);
module.exports = router;
