const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    certificate_type: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    issued_by: {
        type: String,
        required: true
    },

    issue_date: {
        type: Date,
        default: Date.now
    },

    description: {
        type: String
    },

    certificate_url: {
        type: String
    },

    pdf_path: {
        type: String
    }

}, { timestamps: true });

module.exports = mongoose.model(
    "Certificate",
    certificateSchema
);