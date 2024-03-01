const mongoose = require('mongoose');
async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/MediAssist');
        console.log('Successfully Connected');
    } catch (error) {
        console.log('Error connecting');
    }
}
module.exports = { connect };
