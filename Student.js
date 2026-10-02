const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    admission_no: {
        type: String,
        required: true,
        unique: true
    },
    pnr_no: {
        type: String,
        required: true,
        unique: true
    },
    gr_no: {
        type: String
    },
    first_name: {
        type: String,
        required: true
    },
    middle_name: {
        type: String
    },
    surname: {
        type: String,
        required: true
    },
    father_name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String
    },
    photo: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    course: {
        type: String
    },
    department: {
        type: String
    },
    admission_year: {
        type: Number
    },
    current_year: {
        type: Number
    },
    current_semester: {
        type: Number
    },
    status: {
        type: String,
        enum: ["active", "dropped", "graduated"],
        default: "active"
    },
    valid_upto: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);