const Book = require('../models/Book');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
//create book
const createBook = async (req, res) => {
    try {
        //get data from request body
        const { title, author, genre, description, availableCopies, coverImage } = req.body;
        if (!title || !author || !genre || !coverImage || !availableCopies) {
            return res.status(400).json({ msg: "missing data" });
        }
        //chesck if user is admin
        const user = await User.findById(req.user._id);
        if (user.role !== "admin") {
            res.status(403).json({ msg: "you are not authorized to create abook" });
        }
        //create book 
        const book = await Book.create({
            title,
            author,
            genre,
            description,
            totalCopies,
            coverImage,
        });
        //response
        res.status(201).json({
            success: true,
            msg: "Book created successfully",
            data: book,

        })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server error" });
    }

}
//update book
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, genre, description, totalCopies, availableCopies, coverImage } = req.body;
        //check if user is admin
        const user = await User.findById(req.user._id);
        if (user.role !== "admin") {
            res.status(403).json({ msg: "you are not authorized to update a book" });
        }
        //update book
        const book = await Book.findByIdAndUpdate(id, {
            title,
            author,
            genre,
            description,
            totalCopies,
            availableCopies,
            coverImage,
        }, { new: true, runValidators: true });
        if (!book) {
            return res.status(404).json({ msg: "Book not found" });
        }
        //response
        res.status(200).json({
            success: true,
            msg: "Book updated successfully",
            data: book,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server error" });
    }
}
//delete book
const deleteBook=async(req,res)=>{
    try{
        const {id}=req.params;
        //check if user is admin
        const user = await User.findById(req.user._id);
        if (user.role !== "admin") {
            return res.status(403).json({ msg: "you are not authorized to delete a book" });
        }
   //delete book
   const deletedBook=await Book.findByIdAndDelete(id);
   if(!deletedBook){
    return res.status(404).json({ msg: "Book not found" });
   }
    //response
    res.status(200).json({
        success: true,
        msg: "Book deleted successfully",   
    });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ msg: "Server error" });
    }   
}

//get all books
const getAllBooks=async(req,res)=>{
    try{
       
        const limit=req.query.limit||10;
         const books =await Book.find().limit(limit);
         //response
        res.status(200).json({
            success: true,
            data: books
        });

        if(books.length===0){
            return res.status(404).json({ msg: "No books found" });
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({ msg: "Server error" });
    }
}
//get book by id
const getBookById=async(req,res)=>{
    try{
        const {_id}=req.params;
        const book=await Book.findById(_id);
        if(!book){
            return res.status(404).json({ msg: "Book not found" });
        }
        res.status(200).json({
            success: true,
            data: book
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ msg: "Server error" });
    }
}
//search books
const searchBooks = async (req, res) => {
  try {
    const { search, title, author, genre} = req.query;
//filtering
    const filter = {};
//sarch in title, author, genre whith regex
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { author: regex },
        { genre: regex },
      ];
    }
//filter by title, author, genre if user added them in query
    if (title) filter.title = title;
    if (author) filter.author = author;
    if (genre) filter.genre = genre;

//search books with filter and pagination
    const books = await Book.find(filter);
//if no books found
    if (books.length === 0) {
      return res.status(404).json({ msg: "No books found" });
    }
//response
    res.status(200).json({
      success: true,
      data: books,
    });

    }
    catch(err){
        console.log(err);
        res.status(500).json({ msg: "Server error" });
    }
}
module.exports = {
    createBook,
    updateBook,
    deleteBook,
    getAllBooks,
    getBookById,
    searchBooks
}