const express = require("express");
const router = express.Router();
const Committee = require("../models/Committee");
const protect = require("../middleware/authMiddleware");

// Assign student to committee
router.post("/assign", protect, async (req, res) => {
    try {
        const committee = new Committee(req.body);
        await committee.save();

        res.status(201).json({
            message: "Student assigned to committee successfully",
            committee
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get all committee records of a student
router.get("/student/:id", async (req, res) => {
    try {
        const records = await Committee.find({
            student_id: req.params.id
        });

        res.status(200).json(records);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Update committee record
router.put("/update/:id", protect, async (req, res) => {
    try {
        const updated = await Committee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Committee record not found"
            });
        }

        res.status(200).json({
            message: "Committee record updated successfully",
            updated
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get all committees
router.get("/all", async (req, res) => {
    try {
        const committees = await Committee.find();

        res.status(200).json(committees);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;