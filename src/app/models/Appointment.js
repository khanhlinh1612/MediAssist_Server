const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema(
    {
        title: { type: String },
        start: { type: Date },
        end: { type: Date },
        content: { type: String },
        patientName: { type: String },
        patientPhone: { type: String },
        doctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
        patient: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true },
);

const Appointment = mongoose.model('Appointment', AppointmentSchema);
module.exports = Appointment;
