const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authMiddleware");


// Register
router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        // Restrict admin roles from public registration
        if (role !== "placement_student") {
            return res.status(403).json({
                message:
                    "Only placement students can self-register. Administrative accounts must be created by Super Admin."
            });
        }

        const existingUser = await Admin.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({
            name,
            email,
            password: hashedPassword,
            role
        });

        await admin.save();

        res.status(201).json({
            message: "Registered successfully",
            role: admin.role
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Super Admin creates admin accounts
router.post("/create-admin", protect, async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                message: "Only Super Admin can create admin accounts"
            });
        }

        const {
            name,
            email,
            password,
            role
        } = req.body;

        const existingUser = await Admin.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({
            name,
            email,
            password: hashedPassword,
            role
        });

        await admin.save();

        res.status(201).json({
            message: "Admin account created successfully",
            role: admin.role
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get all admins (Super Admin only)
router.get("/admins", protect, async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                message: "Only Super Admin can view all admins"
            });
        }

        const admins = await Admin.find().select("-password");

        res.status(200).json(admins);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter both email and password"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 1. Find user by email (case-insensitive)
        const admin = await Admin.findOne({
            email: new RegExp(`^${normalizedEmail}$`, "i")
        });

        if (!admin) {
            return res.status(404).json({
                message: "No account found with this email address."
            });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password. Please check your credentials."
            });
        }

        // 3. Generate token using actual stored account role
        const token = jwt.sign(
            {
                id: admin._id,
                role: admin.role
            },
            process.env.JWT_SECRET || "smartcampus_secret",
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            role: admin.role
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Delete Admin (Super Admin only)
router.delete("/delete-admin/:id", protect, async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                message: "Only Super Admin can delete admins"
            });
        }

        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        // Prevent deleting yourself
        if (admin._id.toString() === req.user.id) {
            return res.status(400).json({
                message: "You cannot delete your own account"
            });
        }

        await Admin.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Admin deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;