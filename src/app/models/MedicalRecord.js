const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const MedicalRecordSchema = new Schema(
    {
        age: {
            type: Number,
        },
        gender: {
            type: Number,
        },
        maxHeartRate: {
            type: Number,
        },
        restElectrocardiographicResult: {
            type: Number,
        },
        exerciseAngina: {
            type: Number,
        },
        cholesterol: {
            type: Number,
        },
        chestPain: {
            type: Number,
        },
        restBloodPressure: {
            type: Number,
        },
        bloodSugar: {
            type: Number,
        },
        oldPeak: {
            type: Number,
        },
        slope: {
            type: Number,
        },
        numOfVessels: {
            type: Number,
        },
        thalRate: {
            type: Number,
        },
    },
    { timestamps: true },
);

MedicalRecordSchema.plugin(uniqueValidator);

const MedicalRecord = mongoose.model('MedicalRecord', MedicalRecordSchema);
module.exports = MedicalRecord;
