const express = require("express");
const router = express.Router();
const {
    createBook,
    updateBook,
    deleteBook,
    getAllBooks,
    getBookById,
    searchBooks,
} = require("../controllers/bookController");
const {
    authMiddleware,
    allowedToMiddleware,
} = require("../middlewares/authMiddlewares");
const validate = require("../middlewares/validationMiddleware");
const upload = require("../middlewares/uploadfile");
const {
    createBookValidation,
    updateBookValidation,
} = require("../validations/bookValidationSchema");
router.post(
    "/create",
    upload.single("coverImage"),
    authMiddleware,
    allowedToMiddleware("admin"),
    validate(createBookValidation),
    createBook,
);
router.put(
    "/update/:id",
    authMiddleware,
    allowedToMiddleware("admin"),
    validate(updateBookValidation),
    updateBook,
);
router.delete(
    "/delete/:id",
    authMiddleware,
    allowedToMiddleware("admin"),
    deleteBook,
);
router.get("/search", searchBooks);
router.get("/all", getAllBooks);
router.get("/view/:id", getBookById);

module.exports = router;
