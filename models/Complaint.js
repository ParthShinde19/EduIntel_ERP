const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Resolved"],
        default: "Pending"
    },
    resolution_note: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model(
    "Complaint",
    complaintSchema
);