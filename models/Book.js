const { string } = require('joi');
const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true,
        enum: ['Fiction','Horror', 'Science', 'History', 'Technology', 'Other']
    },
    description: {
        type: String,
        default: "no description"
    },
    totalCopies: {
        type: Number,
        required: true,
        min: 0,
        deafault:1
    },
    availableCopies: {
        type: Number,
        deafault:function(){
            return this.totalCopies;    
        },
        min: 0
    },
    coverImage: String,
   // publishedYear: Number





}, { timestamps: true });
const Book = mongoose.model('Book', bookSchema);
module.exports = Book;