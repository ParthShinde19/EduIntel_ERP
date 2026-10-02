const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
    academic_year: {
        type: String, // e.g. "2024-2025"
        required: true
    },
    department: {
        type: String,
        required: true
    },
    year_code: {
        type: String,
        enum: ["FE", "SE", "TE", "BE", "GRADUATED"],
        default: "FE"
    },
    batch_name: {
        type: String, // e.g. "2024-FE-CS-A"
        required: true,
        unique: true
    },
    section: {
        type: String,
        default: "A"
    },
    student_count: {
        type: Number,
        default: 0
    },
    is_active: {
        type: Boolean,
        default: true
    },
    last_promoted: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("Batch", batchSchema);
