const mongoose = require("mongoose");

const issuedBookSchema = new mongoose.Schema({
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

  status: {
    type: String,
    enum: ["Issued", "Returned", "Overdue"],
    default: "Issued"
  }
}, { timestamps: true });

module.exports = mongoose.model("IssuedBook", issuedBookSchema);