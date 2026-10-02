const express = require("express");
const router = express.Router();

const IssuedBook = require("../models/IssuedBook");
const Book = require("../models/Book");
const Student = require("../models/Student");


// Issue Book
router.post("/issue", async (req, res) => {
  try {
    const { student_id, book_id, due_date } = req.body;

    const student = await Student.findById(student_id);
    const book = await Book.findById(book_id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({
        message: "Book out of stock"
      });
    }

    const issue = new IssuedBook({
      student_id,
      book_id,
      due_date
    });

    await issue.save();

    book.available_copies -= 1;
    await book.save();

    res.status(201).json({
      message: "Book issued successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Return Book
router.put("/return/:id", async (req, res) => {
  try {
    const issue = await IssuedBook.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue record not found"
      });
    }

    issue.status = "Returned";
    issue.return_date = new Date();

    await issue.save();

    const book = await Book.findById(issue.book_id);

    book.available_copies += 1;
    await book.save();

    res.status(200).json({
      message: "Book returned successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Get all issued books
router.get("/all", async (req, res) => {
  try {
    const data = await IssuedBook.find()
      .populate("student_id")
      .populate("book_id");

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;