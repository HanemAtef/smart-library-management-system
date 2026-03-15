require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
//database connection
const connectDB=require("./config/dbConnection")
connectDB();



//routes
const userRoutes=require("./routes/userRoutes");
const bookRoutes=require("./routes/bookRoutes")
app.use("/api/users",userRoutes);
app.use("/api/books",bookRoutes)
//listening to the server
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`); 
})