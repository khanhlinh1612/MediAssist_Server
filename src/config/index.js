const mongoose = require('mongoose');

async function connect() {
    try {
        const password = '0JD7yYqq0gpNN8Ju';
        const uri = `mongodb+srv://linhpham1612:${password}@cluster0.hp2ppcy.mongodb.net/MediAssist?retryWrites=true&w=majority&appName=Cluster0`;

        await mongoose.connect(uri);

        console.log('Successfully connected to MongoDB server');
    } catch (error) {
        console.error('Error connecting to MongoDB server:', error.message);
    }
}

module.exports = { connect };
