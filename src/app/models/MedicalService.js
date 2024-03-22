const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const MedicalServiceSchema = new Schema(
    {
        name: { type: String, unique: true },
        description: { type: String },
        price: { type: Number },
    },
    { timestamps: true },
);
MedicalServiceSchema.plugin(uniqueValidator);
const MedicalService = mongoose.model('MedicalService', MedicalServiceSchema);
module.exports = MedicalService;
