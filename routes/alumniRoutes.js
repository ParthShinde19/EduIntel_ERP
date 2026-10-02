const express = require("express");
const router = express.Router();
const Alumni = require("../models/Alumni");
const protect = require("../middleware/authMiddleware");


// Add alumni record
router.post("/add", protect, async (req, res) => {
    try {
        const alumni = new Alumni(req.body);
        await alumni.save();

        res.status(201).json({
            message: "Alumni record added successfully",
            alumni
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get all alumni
router.get("/all", async (req, res) => {
    try {
        const alumni = await Alumni.find();

        res.status(200).json(alumni);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Update alumni record
router.put("/update/:id", protect, async (req, res) => {
    try {
        const updatedAlumni = await Alumni.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            message: "Alumni record updated successfully",
            updatedAlumni
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;