const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DrugSchema = new Schema({
    name: { type: String },
    dosage: { type: String },
    quantity: { type: Number },
    price: { type: Number },
});
const PrescriptionSchema = new Schema(
    {
        drugs: [DrugSchema],
        history: { type: Schema.Types.ObjectId, ref: 'History' },
    },
    { timestamps: true },
);

const Prescription = mongoose.model('Prescription', PrescriptionSchema);
module.exports = Prescription;
