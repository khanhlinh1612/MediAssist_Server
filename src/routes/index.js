const postsRouter = require('./posts');
const siteRouter = require('./site');
const profileRouter = require('./profile');
function route(app) {
    app.use('/posts', postsRouter);
    app.use('/profile', profileRouter);
    app.use('/', siteRouter);
}
module.exports = route;
