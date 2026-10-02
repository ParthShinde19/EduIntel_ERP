const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
require("dotenv").config();

const accounts = [
    {
        name: "Super Admin",
        email: "admin@college.com",
        password: "admin123",
        role: "super_admin"
    },
    {
        name: "Admission Admin",
        email: "admission@college.com",
        password: "admin123",
        role: "admission_admin"
    },
    {
        name: "Library Admin",
        email: "library@college.com",
        password: "admin123",
        role: "library_admin"
    },
    {
        name: "NSS Admin",
        email: "nss@college.com",
        password: "admin123",
        role: "nss_admin"
    },
    {
        name: "Placement Admin",
        email: "placement@college.com",
        password: "admin123",
        role: "placement_admin"
    },
    {
        name: "Placement Student",
        email: "student@college.com",
        password: "admin123",
        role: "placement_student"
    },
    {
        name: "Exam Admin",
        email: "exam@college.com",
        password: "admin123",
        role: "exam_admin"
    },
    {
        name: "Faculty Teacher",
        email: "teacher@college.com",
        password: "admin123",
        role: "teacher",
        teacher_info: {
            role_type: "Class Teacher",
            academic_year: "2024-2025",
            year_code: "FE",
            semester: 1,
            department: "Computer Science",
            division: "A",
            belongs_to_committee: true,
            committee_name: "CSI",
            committee_role: "Head"
        }
    }
];

const seedAccounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_campus_management");
        console.log("MongoDB Connected for seeding admin accounts");

        const hashedPassword = await bcrypt.hash("admin123", 10);

        for (const acc of accounts) {
            const exists = await Admin.findOne({ email: acc.email });
            if (!exists) {
                await Admin.create({
                    name: acc.name,
                    email: acc.email,
                    password: hashedPassword,
                    role: acc.role
                });
                console.log(`Created account: ${acc.role} (${acc.email})`);
            } else {
                console.log(`Account already exists: ${acc.role} (${acc.email})`);
            }
        }

        console.log("Admin seeding completed successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Seeding error:", error.message);
        process.exit(1);
    }
};

seedAccounts();