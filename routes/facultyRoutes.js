const express = require("express");
const router = express.Router();
const Faculty = require("../models/Faculty");
const protect = require("../middleware/authMiddleware");


// Add faculty (Admin)
router.post("/add", protect, async (req, res) => {
    try {
        const faculty = new Faculty(req.body);
        await faculty.save();

        res.status(201).json({
            message: "Faculty added successfully",
            faculty
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get all active faculty (Website/Public)
router.get("/all", async (req, res) => {
    try {
        const faculty = await Faculty.find({
            status: "Active"
        }).sort({ department: 1 });

        res.status(200).json(faculty);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get faculty by department
router.get("/department/:department", async (req, res) => {
    try {
        const faculty = await Faculty.find({
            department: req.params.department,
            status: "Active"
        });

        res.status(200).json(faculty);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Update faculty
router.put("/update/:id", protect, async (req, res) => {
    try {
        const updated = await Faculty.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        res.status(200).json({
            message: "Faculty updated successfully",
            updated
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Delete faculty
router.delete("/delete/:id", protect, async (req, res) => {
    try {
        await Faculty.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Faculty deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;