const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DrugSchema = new Schema({
    medicine: { type: Schema.Types.ObjectId, ref: 'Medicine' },
    dosage: { type: String },
    quantity: { type: Number },
    price: { type: Number },
});
const PresciptionSchema = new Schema(
    {
        drugs: [DrugSchema],
        history: { type: Schema.Types.ObjectId, ref: 'History' },
    },
    { timestamps: true },
);

const Presciption = mongoose.model('Presciption', PresciptionSchema);
module.exports = Presciption;
