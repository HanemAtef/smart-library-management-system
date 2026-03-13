const express = require('express');
const router = express.Router();
const { createBook, updateBook, deleteBook, getAllBooks, getBookById, searchBooks } = require('../controllers/bookController');
//for validation
const { authMiddleware, allowedToMiddleware } = require('../middlewares/authMiddlewares');
const validate = require('../middlewares/validationMiddleware');
const { createBookSchema, updateBookSchema } = require('../validations/bookValidationSchema');

router.post("/create",authMiddleware,allowedToMiddleware("admin"), validate(createBookSchema), createBook);
router.put("/update/:id",authMiddleware,allowedToMiddleware("admin"), validate(updateBookSchema), updateBook);
router.delete("/delete/:id",authMiddleware,allowedToMiddleware("admin"), deleteBook);
router.get("/all", getAllBooks);
router.get("/search", searchBooks);
router.get("/view/:id", getBookById);    
module.exports = router;