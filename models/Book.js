const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    book_name: {
        type: String,
        required: true
    },
    author_name: {
        type: String,
        required: true
    },
    published_year: {
        type: Number
    },
    edition: {
        type: String
    },
    total_copies: {
        type: Number,
        required: true
    },
    available_copies: {
        type: Number,
        required: true
    },
    category: {
        type: String
    },
    status: {
        type: String,
        default: "Available"
    }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);