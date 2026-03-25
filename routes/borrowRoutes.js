const express = require("express");
const router = express.Router();
const {
  borrowBook,
  getActiveBorrows,
  getMyHistory,
  returnBook,
  getAllOverdue,
  finePaid,
} = require("../controllers/borrowControllers");
const {authMiddleware, allowedToMiddleware}=require("../middlewares/authMiddlewares");
//user route
router.post('/:bookId', authMiddleware, borrowBook);
router.get('/active', authMiddleware, getActiveBorrows);
router.get('/my-history', authMiddleware, getMyHistory);
router.put('/return/:borrowId', authMiddleware, returnBook);
//Admin
router.get('/overdue', authMiddleware, allowedToMiddleware('admin'), getAllOverdue);
router.put('/pay-fine/:borrowId', authMiddleware, allowedToMiddleware('admin'), finePaid);

module.exports=router;