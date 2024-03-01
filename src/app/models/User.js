const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const UserSchema = new Schema({
    gender: { type: String, default: '' },
    birthday: { type: Date, default: '' },
    phone_number: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    first_name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    is_doctor: { type: Boolean, default: false },
    avatar: {
        type: String,
        default:
            'https://mhchealthcare.org/wp-content/uploads/2019/05/doctor-avatar-1.jpg',
    },
});
UserSchema.plugin(uniqueValidator);
const User = mongoose.model('User', UserSchema);
module.exports = User;
