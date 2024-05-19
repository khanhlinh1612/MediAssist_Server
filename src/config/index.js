const mongoose = require('mongoose');

async function connect() {
    try {
        const password = process.env.MONGO_PASSWORD;
        const user = process.env.MONGO_USER;
        const dbName = process.env.MONGO_DB_NAME;
        const clusterUrl = process.env.MONGO_CLUSTER_URL;
        const uri = `mongodb+srv://${user}:${password}@${clusterUrl}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
        // const uri = `mongodb+srv://linhpham1612:${password}@cluster0.hp2ppcy.mongodb.net/MediAssist?retryWrites=true&w=majority&appName=Cluster0`;
        console.log(`Connecting to MongoDB with URI: ${uri}`);
        await mongoose.connect(uri);

        console.log('Successfully connected to MongoDB server');
    } catch (error) {
        console.error('Error connecting to MongoDB server:', error.message);
    }
}

module.exports = { connect };
