// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    genre: {
        type: String,
        required: true,
        enum: ['Fiction', 'Horror', 'Science', 'History', 'Technology', 'Other']
    },
    description: {
        type: String,
        default: "no description"
    },
    totalCopies: {
        type: Number,
        required: true,
        min: 0,
        default: 1  
    },
    availableCopies: {
        type: Number,
        default: function () {
            return this.totalCopies;
        },
        min: 0
    },
    coverImage: {
        type: String,
        default: 'default-cover.jpg'

    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
}, { timestamps: true });


bookSchema.index({
    title: "text",
    author: "text",
    genre: "text",
    description: "text"
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;