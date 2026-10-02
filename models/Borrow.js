const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },

    issue_date: {
        type: Date,
        default: Date.now
    },

    due_date: {
        type: Date,
        required: true
    },

    return_date: {
        type: Date
    },

    late_days: {
        type: Number,
        default: 0
    },

    fine_amount: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["Borrowed", "Returned"],
        default: "Borrowed"
    }

}, { timestamps: true });

module.exports = mongoose.model("Borrow", borrowSchema);