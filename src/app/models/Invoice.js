const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ServiceSchema = new Schema({
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalService' },
    name: { type: String },
    price: { type: Number },
});
const DrugSchema = new Schema({
    medicine: { type: Schema.Types.ObjectId, ref: 'Medicine' },
    dosage: { type: String },
    quantity: { type: Number },
});
const InvoiceSchema = new Schema(
    {
        patient: { type: Schema.Types.ObjectId, ref: 'User' },
        paymentInfo: {
            paymentMethod: String,
            amountPaid: Number,
            paymentDate: Date,
        },
        medicalServices: [ServiceSchema],
        medicines: [DrugSchema],
        total: { type: Number },
        status: { type: String, default: 'pending' },
    },
    { timestamps: true },
);

const Invoice = mongoose.model('Invoice', InvoiceSchema);
module.exports = Invoice;
