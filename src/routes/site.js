const express = require('express');
const router = express.Router();
const siteController = require('../app/controllers/SiteController');
router.get('/', (req, res) => {
    res.send('Trang chủ của MediAssist');
});
router.get('/totalCount', siteController.totalCount);
router.post('/register', siteController.register);
router.post('/login', siteController.login);
router.post('/logout', siteController.logout);
module.exports = router;
