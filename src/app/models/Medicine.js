const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const MedicineSchema = new Schema(
    {
        name: { type: String, unique: true },
        frequency: { type: String },
        activeIngredient: String,
        endDate: { type: Date },
        unit: String,
        price: Number,
    },
    { timestamps: true },
);
MedicineSchema.plugin(uniqueValidator);
const Medicine = mongoose.model('Medicine', MedicineSchema);
module.exports = Medicine;
