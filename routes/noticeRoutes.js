const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");
const protect = require("../middleware/authMiddleware");


// Add notice (Admin only)
router.post("/add", protect, async (req, res) => {
    try {
        const notice = new Notice(req.body);
        await notice.save();

        res.status(201).json({
            message: "Notice added successfully",
            notice
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get all notices (Website/public)
router.get("/all", async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });

        res.status(200).json(notices);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Update notice
router.put("/update/:id", protect, async (req, res) => {
    try {
        const updated = await Notice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Notice not found"
            });
        }

        res.status(200).json({
            message: "Notice updated successfully",
            updated
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Delete notice
router.delete("/delete/:id", protect, async (req, res) => {
    try {
        const deleted = await Notice.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                message: "Notice not found"
            });
        }

        res.status(200).json({
            message: "Notice deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;