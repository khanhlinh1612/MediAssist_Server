const express = require('express');
const router = express.Router();
const profileController = require('../app/controllers/ProfileController');

router.get('/', profileController.show);

module.exports = router;
