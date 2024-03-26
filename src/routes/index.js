const postsRouter = require('./posts');
const siteRouter = require('./site');
const profileRouter = require('./profile');
const appointmentRouter = require('./appointment');
const patientRouter = require('./patient');
const historyRouter = require('./history');
const prescriptionRouter = require('./prescription');
const medicalRecordRouter = require('./medicalRecord');
function route(app) {
    app.use('/posts', postsRouter);
    app.use('/profile', profileRouter);
    app.use('/', siteRouter);
    app.use('/appointments', appointmentRouter);
    app.use('/patient', patientRouter);
    app.use('/history', historyRouter);
    app.use('/prescription', prescriptionRouter);
    app.use('/medicalRecord', medicalRecordRouter);
}
module.exports = route;
