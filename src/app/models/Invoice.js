const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ServiceSchema = new Schema({
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalService' },
    name: { type: String },
    price: { type: Number },
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
        medicines: [],
        total: { type: Number },
        status: { type: String, default: 'pending' },
    },
    { timestamps: true },
);

const Invoice = mongoose.model('Invoice', InvoiceSchema);
module.exports = Invoice;
