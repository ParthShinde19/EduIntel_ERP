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
    blood_group: {
        type: String,
        default: "O+"
    },
    emergency_contact: {
        type: String
    },
    residential_address: {
        type: String
    },
    // Editable Parent Fields
    parent_phone: {
        type: String
    },
    parent_address: {
        type: String
    },
    course: {
        type: String,
        default: "B.Tech Engineering"
    },
    department: {
        type: String,
        default: "Computer Science"
    },
    admission_year: {
        type: Number,
        default: 2024
    },
    academic_year: {
        type: String,
        default: "2024-2025"
    },
    year_code: {
        type: String,
        enum: ["FE", "SE", "TE", "BE", "GRADUATED"],
        default: "FE"
    },
    current_year: {
        type: Number,
        default: 1
    },
    current_semester: {
        type: Number,
        default: 1
    },
    division: {
        type: String,
        default: "A"
    },
    roll_no: {
        type: String
    },
    batch_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch"
    },
    batch_name: {
        type: String
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