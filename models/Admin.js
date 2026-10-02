const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: [
            "super_admin",
            "admission_admin",
            "library_admin",
            "nss_admin",
            "placement_admin",
            "placement_student",
            "exam_admin",
            "teacher"
        ],
        required: true
    },

    teacher_info: {
        role_type: { type: String, default: "Class Teacher" },
        academic_year: { type: String, default: "2024-2025" },
        year_code: { type: String, default: "FE" },
        semester: { type: Number, default: 1 },
        department: { type: String, default: "Computer Science" },
        division: { type: String, default: "A" },
        belongs_to_committee: { type: Boolean, default: false },
        committee_name: { type: String, default: "" },
        committee_role: { type: String, default: "Member" }
    }

}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);