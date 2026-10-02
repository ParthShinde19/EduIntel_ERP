const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const protect = require("../middleware/authMiddleware");


// Add Book
router.post("/add", protect, async (req, res) => {
  try {
    const {
      book_name,
      author_name,
      published_year,
      edition,
      total_copies,
      category
    } = req.body;

    const book = new Book({
      book_name,
      author_name,
      published_year,
      edition,
      total_copies,
      available_copies: total_copies,
      category
    });

    await book.save();

    res.status(201).json({
      message: "Book added successfully",
      book
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Get All Books
router.get("/all", protect, async (req, res) => {
  try {
    const books = await Book.find();

    res.status(200).json(books);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Delete Book
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Book deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Update Book
router.put("/update/:id", protect, async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedBook);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;