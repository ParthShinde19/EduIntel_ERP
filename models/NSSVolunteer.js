const mongoose = require("mongoose");

const nssVolunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    roll_no: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String
    },
    year: {
        type: Number
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    hours_completed: {
        type: Number,
        default: 0
    },
    camp_attended: {
        type: Boolean,
        default: false
    },
    blood_donation: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: "Volunteer"
    }
}, { timestamps: true });

module.exports = mongoose.model("NSSVolunteer", nssVolunteerSchema);