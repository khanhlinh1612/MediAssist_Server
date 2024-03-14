const postsRouter = require('./posts');
const siteRouter = require('./site');
const profileRouter = require('./profile');
const appointmentRouter = require('./appointment');
const patientRouter = require('./patient');
function route(app) {
    app.use('/posts', postsRouter);
    app.use('/profile', profileRouter);
    app.use('/', siteRouter);
    app.use('/appointments', appointmentRouter);
    app.use('/patient', patientRouter);
}
module.exports = route;
