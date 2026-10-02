const express = require("express");
const router = express.Router();
const Gallery = require("../models/Gallery");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


// Upload image
router.post(
    "/upload",
    protect,
    upload.single("image"),
    async (req, res) => {
        try {
            const gallery = new Gallery({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
                image_url: req.file.path,
                uploaded_by: req.body.uploaded_by
            });

            await gallery.save();

            res.status(201).json({
                message: "Image uploaded successfully",
                gallery
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);


// Get all gallery images
router.get("/all", async (req, res) => {
    try {
        const images = await Gallery.find().sort({ createdAt: -1 });

        res.status(200).json(images);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Delete image
router.delete("/delete/:id", protect, async (req, res) => {
    try {
        await Gallery.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Image deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;