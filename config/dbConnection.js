const mongoose = require('mongoose');
async function connectDB() {
    try {
        const BD_URL = process.env.BD_URL;
        await mongoose.connect(BD_URL);
        console.log('Connected to MongoDB');
    }
    catch (err) {
        console.log(err);

    }
}
module.exports=connectDB;