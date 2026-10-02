const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    company_name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    package: {
        type: Number,
        required: true
    },
    internship: {
        type: Boolean,
        default: false
    },
   offer_status: {
    type: String,
    enum: ["Applied", "Shortlisted", "Selected", "Rejected", "Joined"],
    default: "Applied"
},
    joining_date: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model(
    "Placement",
    placementSchema
);