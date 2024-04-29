const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const DoctorSchema = new Schema({
    fullname: { type: String, default: '' },
    gender: { type: String, default: '' },
    birthday: { type: Date, default: '' },
    age: { type: Number, default: '' },
    email: { type: String, default: '' },
    phone_number: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    first_name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    address: { type: String, default: '' },
    is_active: { type: Boolean, default: false },
    idNumber: { type: String, default: '', unique: true }, // CCCD ID number
    avatar: {
        type: String,
        default:
            'https://mhchealthcare.org/wp-content/uploads/2019/05/doctor-avatar-1.jpg',
    },
    experienced_year: { type: Number, default: 0 },
    specialist: [{ type: String }],
    position: { type: String, default: '' },
    workplace: { type: String, default: '' },
    description: { type: String, default: '' },
});
DoctorSchema.plugin(uniqueValidator);
const Doctor = mongoose.model('Doctor', DoctorSchema);
module.exports = Doctor;
