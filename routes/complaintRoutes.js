const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const protect = require("../middleware/authMiddleware");


// Submit complaint
router.post("/submit", protect, async (req, res) => {
    try {
        const complaint = new Complaint(req.body);
        await complaint.save();

        res.status(201).json({
            message: "Complaint submitted successfully",
            complaint
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get all complaints
router.get("/all", protect, async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("student_id");

        res.status(200).json(complaints);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get student complaints
router.get("/student/:studentId", protect, async (req, res) => {
    try {
        const complaints = await Complaint.find({
            student_id: req.params.studentId
        });

        res.status(200).json(complaints);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Update complaint status
router.put("/update/:id", protect, async (req, res) => {
    try {
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            message: "Complaint updated successfully",
            updatedComplaint
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;