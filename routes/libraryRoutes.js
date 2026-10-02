const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const protect = require("../middleware/authMiddleware");


// Add Book (Admin only)
router.post("/add-book", protect, async (req, res) => {
    try {
        const book = new Book(req.body);
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


// Get all books
router.get("/books", async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Borrow book
router.post("/borrow", protect, async (req, res) => {
    try {
        const { student_id, book_id, due_date } = req.body;

        const book = await Book.findById(book_id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        if (book.available_copies <= 0) {
            return res.status(400).json({
                message: "Book unavailable"
            });
        }

        const borrow = new Borrow({
            student_id,
            book_id,
            due_date,
            status: "Borrowed"
        });

        await borrow.save();

        book.available_copies -= 1;
        await book.save();

        res.status(201).json({
            message: "Book borrowed successfully",
            borrow
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Return book
router.put("/return/:id", protect, async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id);

        if (!borrow) {
            return res.status(404).json({
                message: "Borrow record not found"
            });
        }

        if (borrow.status === "Returned") {
            return res.status(400).json({
                message: "Book already returned"
            });
        }

        borrow.return_date = new Date();
        borrow.status = "Returned";
        borrow.late_days = 0;
        borrow.fine_amount = 0;

        // Fine calculation
        if (borrow.return_date > borrow.due_date) {
            const lateDays = Math.ceil(
                (borrow.return_date - borrow.due_date) / (1000 * 60 * 60 * 24)
            );

            borrow.late_days = lateDays;
            borrow.fine_amount = lateDays * 10;
        }

        await borrow.save();

        const book = await Book.findById(borrow.book_id);

        if (book) {
            book.available_copies += 1;
            await book.save();
        }

        res.status(200).json({
            message: "Book returned successfully",
            borrow
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Fine checker
router.get("/fine/:id", protect, async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id)
            .populate("book_id");

        if (!borrow) {
            return res.status(404).json({
                message: "Borrow record not found"
            });
        }

        res.status(200).json({
            book: borrow.book_id.title,
            due_date: borrow.due_date,
            late_days: borrow.late_days || 0,
            fine_amount: borrow.fine_amount || 0
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Overdue books
router.get("/overdue", protect, async (req, res) => {
    try {
        const overdueBooks = await Borrow.find({
            due_date: { $lt: new Date() },
            status: { $ne: "Returned" }
        })
        .populate("student_id")
        .populate("book_id");

        res.status(200).json(overdueBooks);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Borrow history of student
router.get("/history/:studentId", async (req, res) => {
    try {
        const history = await Borrow.find({
            student_id: req.params.studentId
        }).populate("book_id");

        res.status(200).json(history);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Student Library Transparency Status for Unified Profile
router.get("/student-status/:studentId", async (req, res) => {
    try {
        const records = await Borrow.find({
            student_id: req.params.studentId
        }).populate("book_id").sort({ createdAt: -1 });

        const activeBorrows = records.filter(r => r.status === "Borrowed" || r.status === "Issued");
        const overdueBorrows = activeBorrows.filter(r => r.due_date && new Date(r.due_date) < new Date());
        
        const maxLimit = 3;
        const currentlyBorrowed = activeBorrows.length;
        const eligibleToBorrow = currentlyBorrowed < maxLimit && overdueBorrows.length === 0;

        res.status(200).json({
            student_id: req.params.studentId,
            currently_borrowed_count: currentlyBorrowed,
            max_limit: maxLimit,
            has_overdue_books: overdueBorrows.length > 0,
            eligible_to_borrow: eligibleToBorrow,
            borrowed_records: records
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;