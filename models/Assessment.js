const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    academic_year: {
        type: String,
        required: true,
        default: "2024-2025"
    },
    year_code: {
        type: String,
        enum: ["FE", "SE", "TE", "BE"],
        required: true,
        default: "FE"
    },
    semester: {
        type: Number,
        required: true,
        default: 1
    },
    department: {
        type: String,
        required: true,
        default: "Computer Science"
    },
    division: {
        type: String,
        required: true,
        default: "A"
    },
    subject_name: {
        type: String,
        default: "General Subject"
    },
    ia1_marks: {
        type: Number,
        default: 0
    },
    ia2_marks: {
        type: Number,
        default: 0
    },
    lecture_attendance_present: {
        type: Number,
        default: 0
    },
    lecture_attendance_total: {
        type: Number,
        default: 0
    },
    practical_attendance_present: {
        type: Number,
        default: 0
    },
    practical_attendance_total: {
        type: Number,
        default: 0
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
}, { timestamps: true });

// Ensure unique record per student + academic_year + semester + subject
assessmentSchema.index({ student_id: 1, academic_year: 1, semester: 1, subject_name: 1 }, { unique: true });

module.exports = mongoose.model("Assessment", assessmentSchema);
