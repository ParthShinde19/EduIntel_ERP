const express = require("express");
const router = express.Router();
const Placement = require("../models/Placement");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const XLSX = require("xlsx");


// Add placement record
router.post("/add", protect, async (req, res) => {
    try {
        const { student_id, company_name } = req.body;

        const existing = await Placement.findOne({
            student_id,
            company_name
        });

        if (existing) {
            return res.status(400).json({
                message: "Placement record already exists"
            });
        }

        const placement = new Placement(req.body);
        await placement.save();

        res.status(201).json({
            message: "Placement record added successfully",
            placement
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Bulk upload placements (Excel)
router.post(
    "/upload",
    protect,
    upload.single("file"),
    async (req, res) => {
        try {
            const workbook = XLSX.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const data = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheetName]
            );

            await Placement.insertMany(data);

            res.status(201).json({
                message: "Placement records uploaded successfully",
                total_records: data.length
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);


// Upload resume
router.post(
    "/resume/:studentId",
    protect,
    upload.single("resume"),
    async (req, res) => {
        try {
            res.status(200).json({
                message: "Resume uploaded successfully",
                file_path: req.file.path
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);


// Add company drive
router.post("/drive", protect, async (req, res) => {
    try {
        const drive = {
            company_name: req.body.company_name,
            role: req.body.role,
            package: req.body.package,
            drive_date: req.body.drive_date,
            eligibility: req.body.eligibility
        };

        res.status(201).json({
            message: "Company drive posted successfully",
            drive
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get all placement records
router.get("/all", protect, async (req, res) => {
    try {
        const placements = await Placement.find()
            .populate("student_id");

        res.status(200).json(placements);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get placements by student
router.get("/student/:studentId", protect, async (req, res) => {
    try {
        const placements = await Placement.find({
            student_id: req.params.studentId
        });

        res.status(200).json(placements);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Update placement status
router.put("/update/:id", protect, async (req, res) => {
    try {
        const updatedPlacement = await Placement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            message: "Placement updated successfully",
            updatedPlacement
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;