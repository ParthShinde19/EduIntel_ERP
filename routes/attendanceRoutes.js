const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const XLSX = require("xlsx");

const upload = multer({ dest: "uploads/" });


// Mark attendance
router.post("/mark", protect, async (req, res) => {
    try {
        const { student_id, subject_name, faculty_name, date } = req.body;

        // Prevent duplicate attendance for same day + subject
        const existing = await Attendance.findOne({
            student_id,
            subject_name,
            date
        });

        if (existing) {
            return res.status(400).json({
                message: "Attendance already marked for this student"
            });
        }

        const attendance = new Attendance(req.body);
        await attendance.save();

        res.status(201).json({
            message: "Attendance marked successfully",
            attendance
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Bulk attendance upload (Excel)
router.post("/upload", protect, upload.single("file"), async (req, res) => {
    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetName]
        );

        const attendanceRecords = [];

        for (const row of data) {
            attendanceRecords.push({
                student_id: row.student_id,
                subject_name: row.subject_name,
                faculty_name: row.faculty_name,
                date: row.date,
                status: row.status
            });
        }

        await Attendance.insertMany(attendanceRecords);

        res.status(201).json({
            message: "Bulk attendance uploaded successfully",
            total_records: attendanceRecords.length
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get all attendance
router.get("/all", protect, async (req, res) => {
    try {
        const records = await Attendance.find()
            .populate("student_id");

        res.status(200).json(records);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get student attendance
router.get("/student/:studentId", protect, async (req, res) => {
    try {
        const records = await Attendance.find({
            student_id: req.params.studentId
        });

        res.status(200).json(records);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Attendance percentage
router.get("/percentage/:studentId", protect, async (req, res) => {
    try {
        const total = await Attendance.countDocuments({
            student_id: req.params.studentId
        });

        const present = await Attendance.countDocuments({
            student_id: req.params.studentId,
            status: "Present"
        });

        const percentage =
            total > 0 ? ((present / total) * 100).toFixed(2) : 0;

        res.status(200).json({
            total_classes: total,
            present_classes: present,
            attendance_percentage: percentage + "%"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;