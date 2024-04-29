const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HistorySchema = new Schema(
    {
        fullname: { type: String },
        phoneNumber: { type: String },
        examDate: { type: Date },
        examContent: { type: String },
        symptom: { type: String },
        diagnosis: { type: String },
        reExamDate: { type: Date },
        prescription: { type: Schema.Types.ObjectId, ref: 'Prescription' },
        invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
        doctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
        patient: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true },
);

const History = mongoose.model('History', HistorySchema);
module.exports = History;
