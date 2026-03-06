require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
//database connection
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
connectDB();





//routes
const userRoutes=require("./routes/userRoutes");
app.use("/api/users",userRoutes);

//listening to the server
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`); 
})