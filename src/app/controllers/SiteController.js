const { request } = require('express');

class SiteController {
    //[GET] /
    index(req, res) {
        return res.render('home');
    }

    //[GET] /search
    search(req, res) {
                                return res.render('search');
    }
}
module.exports = new SiteController();
