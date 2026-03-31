const { options } = require('joi');
const Book = require('../models/Book');
const User = require('../models/User');
const bcrypt = require('bcrypt');
//create book
const createBook = async (req, res) => {
    try {
        //get data
        const { title, author, genre, description, totalCopies } = req.body;
          const coverImage = req.file?.filename;
        //check if all data in req
        if (!title || !author || !genre || !coverImage || totalCopies == null) {
            return res.status(400).json({ msg: "Missing required data" });
        }
        //if availableCopies not passed get the value from totalCopies
        const availableCopies = req.body.availableCopies ?? totalCopies;

        //create the book
        const book = await Book.create({
            title,
            author,
            genre,
            description,
            totalCopies,
            availableCopies,
            coverImage,
        });
        //response
        res.status(201).json({
            success: true,
            msg: "Book created successfully",
            data: book,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};
//update book
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, genre, description, totalCopies, availableCopies, coverImage } = req.body;
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
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        //delete book
        const deletedBook = await Book.findByIdAndDelete(id);
        if (!deletedBook) {
            return res.status(404).json({ msg: "Book not found" });
        }
        //response
        res.status(200).json({
            success: true,
            msg: "Book deleted successfully",
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server error" });
    }
}

//get all books
const getAllBooks = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)

    const total = await Book.countDocuments();

    res.status(200).json({
      success: true,
      msg: books.length ? "Books fetched successfully" : "No books yet",
      data: books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBooks: total,
        booksInPage: books.length,
      },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};
//get book by id
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ msg: "Book not found" });
        }
        res.status(200).json({
            success: true,
            data: book
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server error" });
    }
}
//search books
const searchBooks = async (req, res) => {
  try {
    const { search, title, author, genre } = req.query;

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    let filter = {};

    if (search) filter.$text = { $search: search };
    if (title) filter.title = { $regex: title, $options: "i" };
    if (author) filter.author = { $regex: author, $options: "i" };
    if (genre) filter.genre = { $regex: genre, $options: "i" };

    const totalBooks = await Book.countDocuments(filter);

    let query = Book.find(filter);

    if (search) {
      query = query
        .select({ title: 1, author: 1, genre: 1, coverImage: 1, score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const books = await query.limit(limit).skip(skip);

    res.status(200).json({
      success: true,
      msg: books.length ? "Books found" : "No books found",
      data: books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBooks / limit),
        totalBooks,
        booksInPage: books.length,
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};
module.exports = {
    createBook,
    updateBook,
    deleteBook,
    getAllBooks,
    getBookById,
    searchBooks
}