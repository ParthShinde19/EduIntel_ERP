const mongoose = require("mongoose");

const committeeSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    committee_name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    tenure_start: {
        type: Date,
        required: true
    },
    tenure_end: {
        type: Date
    },
    tasks: [
        {
            type: String
        }
    ],
    achievements: [
        {
            type: String
        }
    ],
    status: {
        type: String,
        default: "Active"
    }
}, { timestamps: true });

module.exports = mongoose.model("Committee", committeeSchema);