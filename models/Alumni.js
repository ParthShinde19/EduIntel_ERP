const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    graduation_year: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    current_company: {
        type: String
    },
    designation: {
        type: String
    },
    higher_studies: {
        type: String
    },
    contact_email: {
        type: String
    },
    phone: {
        type: String
    },
    achievements: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model(
    "Alumni",
    alumniSchema
);