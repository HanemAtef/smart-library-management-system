const Borrow = require("../models/Borrow");
const User = require("../models/User");
const Book = require("../models/Book");

// borrow a book
const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    //check for book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, msg: "Book not found" });
    }
    //check for copies
    if (book.availableCopies <= 0) {
      return res
        .status(400)
        .json({ success: false, msg: "No copies available" });
    }
  //user can not borrow same book at the same time
      const alreadyBorrowed = await Borrow.findOne({
      user: userId,
      book: bookId,
      returnDate: null,  
    });
    
    if (alreadyBorrowed) {
      return res.status(400).json({
        success: false,
        msg: "You have already borrowed this book. Return it first.",
      });
    }
    //check for user extreem the limit of borrows
    const user = await User.findById(userId);
    const activeBorrows = await Borrow.countDocuments({
      user: userId,
      returnDate: null,
    });
    if (activeBorrows >= user.borrowLimit) {
      return res.status(400).json({
        success: false,
        msg: `you can only borrow ${user.borrowLimit} at the time`,
      });
    }
    //check for fine
    const unPaidFine = await Borrow.countDocuments({
      user: userId,
      fine: { $gt: 0 },
      finePaid: false,
    });
    if (unPaidFine > 0) {
      return res.status(400).json({
        success: false,
        msg: "You have unpaid fines. Please pay them first.",
      });
    }
    //decrease the copies
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );
    if (!updatedBook) {
      return res.status(400).json({
        success: false,
        msg: "No copies available. Please try again.",
      });
    }
    //calc returnDate
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    //create borrow
    const borrow = await Borrow.create({
      user: userId,
      book: bookId,
      dueDate,
      status: "borrowed",
    });
    //response
    res.status(201).json({
      success: true,
      msg: "Book borrowed successfully",
      data: {
        _id: borrow._id,
        book: {
          _id: updatedBook._id,
          title: updatedBook.title,
          author: updatedBook.author,
        },
        borrowDate: borrow.borrowDate,
        dueDate: borrow.dueDate,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
//////////////////////////////////////////////////////////////////////////
const getActiveBorrows = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const activeBorrows = await Borrow.find({
      user: userId,
      status: { $in: ["borrowed", "overdue"] },
    })
      .populate("book", "title author coverImage")
      .sort({ dueDate: 1 });
    //details
    const borrowsWithDetails = activeBorrows.map((borrow) => {
      const isOverdue = borrow.dueDate < today;
      let daysOverdue = 0;

      if (isOverdue) {
        const diffTime = today - borrow.dueDate;
        daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        _id: borrow._id,
        book: borrow.book,
        borrowDate: borrow.borrowDate,
        dueDate: borrow.dueDate,
        status: borrow.status,
        isOverdue,
        daysOverdue,
        estimatedFine: isOverdue ? daysOverdue * 5 : 0,
      };
    });

    //stats
    const overdueCount = borrowsWithDetails.filter((b) => b.isOverdue).length;

    //res
    res.status(200).json({
      success: true,
      stats: {
        totalActive: activeBorrows.length,
        overdueCount,
      },
      data: borrowsWithDetails,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
//////////////////////////////////////////////////////////////////////////
const getMyHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    //get all borrows
    const allBorrows = await Borrow.find({
      user: userId,
    })
      .populate("book", "title author coverImage")
      .sort({ borrowDate: -1 });
    //seperate the active from the completed
    const active = allBorrows.filter(
      (b) => b.status === "borrowed" || b.status === "overdue",
    );
    const completed = allBorrows.filter((b) => b.status === "returned");
    //calc the fine
    const totalFine = allBorrows.reduce((sum, b) => sum + b.fine, 0);
    //respone
    res.status(200).json({
      success: true,
      stats: {
        total: allBorrows.length,
        active: active.length,
        completed: completed.length,
        totalFine,
      },
      data: allBorrows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
//////////////////////////////////////////////////////////////////////////
const returnBook = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const borrow = await Borrow.findById(borrowId);
    //check if borrow not exist
    if (!borrow) {
      return res
        .status(404)
        .json({ success: false, msg: "Borrow record not found" });
    }
    //check if the book returned
    if (borrow.returnDate) {
      return res.status(400).json({
        success: false,
        msg: "book has been returned",
      });
    }
    //fine
    const today = new Date();
    let fine = 0;
    let daysOverdue = 0;
    if (today > borrow.dueDate) {
      const differ = today - borrow.dueDate;
      daysOverdue = Math.ceil(differ / (1000 * 60 * 60 * 24));
      fine = daysOverdue * 5;//the day in fine with 5 
    }
    //update status
    borrow.returnDate = today;
    borrow.fine = fine;
    borrow.status = fine > 0 ? "overdue" : "returned";
    await borrow.save();
    //increase copies

    const book = await Book.findByIdAndUpdate(
      borrow.book,
      { $inc: { availableCopies: 1 } },
      { new: true }
    );
    //response
    res.status(200).json({
      success: true,
      msg:
        fine > 0
          ? `Book returned late. Fine: ${fine} EGP (${daysOverdue} days overdue)`
          : "book returned successfully",
      data: {
        _id: borrow._id,
        book: {
          _id: book._id,
          title: book.title,
        },
        returnDate: borrow.returnDate,
        fine: borrow.fine,
        finePaid: borrow.finePaid,
        daysOverdue,
        status: borrow.status,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
//////////////////////////////////////////////////////////////////////////
const getAllOverdue = async (req, res) => {
  try {
    const today = new Date();
    //get all borrows
    const overdueBorrows = await Borrow.find({
      returnDate: null,
      dueDate: { $lt: today },
    })
      .populate("book", "title author")
      .populate("user", "name email");
    //details
    const allBorrowDetails = overdueBorrows.map((borrow) => {
      const diffTime = today - borrow.dueDate;
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const fine = daysOverdue * 5;
      return {
        _id: borrow._id,
        user: {
          _id: borrow.user._id,
          name: borrow.user.name,
          email: borrow.user.email,
        },
        book: {
          _id: borrow.book._id,
          title: borrow.book.title,
          author: borrow.book.author,
        },
        borrowDate: borrow.borrowDate,
        dueDate: borrow.dueDate,
        daysOverdue,
        fine,
        finePaid: borrow.finePaid,
      };
    });
    //total fine for all borrows
    const totalFine = allBorrowDetails.reduce((sum, b) => sum + b.fine, 0);
    //res
    res.status(200).json({
      success: true,
      msg: "all overDue",
      count: allBorrowDetails.length,
      totalFine,
      data: allBorrowDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};
/////////////////////////////////////////////////////////////////////////
const finePaid = async (req, res) => {
  try {
    const { borrowId } = req.params;

    const borrow = await Borrow.findById(borrowId);

    if (!borrow) {
      return res.status(404).json({
        success: false,
        msg: "Borrow record not found",
      });
    }

    if (!borrow.fine || borrow.fine <= 0) {
      return res.status(400).json({
        success: false,
        msg: "No fine to pay",
      });
    }

    if (borrow.finePaid) {
      return res.status(400).json({
        success: false,
        msg: "Fine already paid",
      });
    }

    if (!borrow.returnDate) {
      return res.status(400).json({
        success: false,
        msg: "Return the book before paying the fine",
      });
    }

    borrow.finePaid = true;
    await borrow.save();

    res.status(200).json({
      success: true,
      msg: `Fine of ${borrow.fine} EGP has been paid successfully`,
      data: {
        _id: borrow._id,
        fine: borrow.fine,
        finePaid: borrow.finePaid,
        status: borrow.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};
module.exports = {
  borrowBook,
  getActiveBorrows,
  getMyHistory,
  returnBook,
  getAllOverdue,
  finePaid,
};
