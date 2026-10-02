const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    qualification: {
        type: String
    },
    experience_years: {
        type: Number
    },
    email: {
        type: String,
        unique: true
    },
    phone: {
        type: String
    },
    photo: {
        type: String
    },
    joining_date: {
        type: Date
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }
}, { timestamps: true });

module.exports = mongoose.model("Faculty", facultySchema);