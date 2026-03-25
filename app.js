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
const bookRoutes=require("./routes/bookRoutes");
const borrowRoutes=require("./routes/borrowRoutes");
const reviewRoutes=require("./routes/reviewRoutes");
app.use("/api/users",userRoutes);
app.use("/api/books",bookRoutes);
app.use("/api/borrows",borrowRoutes);
app.use("/api/reviews",reviewRoutes);
//listening to the server
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`); 
})