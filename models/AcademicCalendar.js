const mongoose = require("mongoose");

const academicCalendarSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    event_date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        enum: [
            "Holiday",
            "Exam",
            "Admission",
            "Semester",
            "Festival",
            "Result",
            "Deadline"
        ],
        required: true
    },
    uploaded_by: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("AcademicCalendar", academicCalendarSchema);