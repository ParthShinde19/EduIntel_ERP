const express = require("express");
const router = express.Router();
const AcademicRecord = require("../models/AcademicRecord");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const XLSX = require("xlsx");

const upload = multer({ dest: "uploads/" });


// Add Academic Record
router.post("/add-result", protect, async (req, res) => {
    try {
        const { student_id, semester } = req.body;

        const existing = await AcademicRecord.findOne({
            student_id,
            semester
        });

        if (existing) {
            return res.status(400).json({
                message: "Academic record already exists for this semester"
            });
        }

        const record = new AcademicRecord(req.body);
        await record.save();

        res.status(201).json({
            message: "Academic record added",
            record
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Bulk upload academic records
router.post("/upload", protect, upload.single("file"), async (req, res) => {
    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetName]
        );

        await AcademicRecord.insertMany(data);

        res.status(201).json({
            message: "Academic records uploaded successfully",
            total_records: data.length
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get all records of a student
router.get("/student/:id", async (req, res) => {
    try {
        const records = await AcademicRecord.find({
            student_id: req.params.id
        });

        res.status(200).json(records);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// CGPA Calculator
router.get("/cgpa/:id", async (req, res) => {
    try {
        const records = await AcademicRecord.find({
            student_id: req.params.id
        });

        if (records.length === 0) {
            return res.status(404).json({
                message: "No academic records found"
            });
        }

        let totalSGPA = 0;

        records.forEach(record => {
            totalSGPA += record.sgpa;
        });

        const cgpa = (totalSGPA / records.length).toFixed(2);

        res.status(200).json({
            student_id: req.params.id,
            total_semesters: records.length,
            cgpa
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Update academic record
router.put("/update/:id", protect, async (req, res) => {
    try {
        const updated = await AcademicRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Record not found"
            });
        }

        res.status(200).json({
            message: "Academic record updated",
            updated
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Eligibility checker
router.get("/eligibility/:id", async (req, res) => {
    try {
        const records = await AcademicRecord.find({
            student_id: req.params.id
        });

        let isEligible = true;

        records.forEach(record => {
            if (record.overall_status === "Fail") {
                isEligible = false;
            }
        });

        res.status(200).json({
            student_id: req.params.id,
            eligible_for_next_year: isEligible
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;