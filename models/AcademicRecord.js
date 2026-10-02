const mongoose = require("mongoose");

const academicRecordSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    academic_year: {
        type: String,
        default: "2024-2025"
    },

    year_code: {
        type: String,
        enum: ["FE", "SE", "TE", "BE"],
        default: "FE"
    },

    semester: {
        type: Number,
        required: true
    },

    department: {
        type: String,
        default: "Computer Science"
    },

    division: {
        type: String,
        default: "A"
    },

    exam_type: {
        type: String,
        default: "Semester End Exam"
    },

    subjects: [
        {
            subject_name: {
                type: String
            },
            marks: {
                type: Number
            },
            max_marks: {
                type: Number,
                default: 100
            },
            ia1_marks: {
                type: Number,
                default: 0
            },
            ia2_marks: {
                type: Number,
                default: 0
            },
            lecture_attendance: {
                type: Number,
                default: 100
            },
            practical_attendance: {
                type: Number,
                default: 100
            },
            status: {
                type: String
            }
        }
    ],

    sgpa: {
        type: Number,
        required: true
    },

    cgpa: {
        type: Number,
        default: 0
    },

    active_kts: {
        type: Number,
        default: 0
    },

    resolved_kts: {
        type: Number,
        default: 0
    },

    previous_sgpa: {
        type: Number,
        default: 0
    },

    sgpa_history: [
        {
            semester: { type: Number },
            sgpa: { type: Number }
        }
    ],

    overall_status: {
        type: String,
        enum: ["Pass", "Fail", "KT_Pending"],
        default: "Pass"
    }

}, { timestamps: true });

module.exports = mongoose.model(
    "AcademicRecord",
    academicRecordSchema
);