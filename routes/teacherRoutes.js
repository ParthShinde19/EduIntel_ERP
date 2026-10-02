const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Assessment = require("../models/Assessment");
const protect = require("../middleware/authMiddleware");
const { parseTeacherFile } = require("../utils/aiParser");

const upload = multer({ dest: "uploads/" });

// Update Teacher Role Setup & Committee Info
router.post("/profile-role", protect, async (req, res) => {
    try {
        const {
            role_type,
            academic_year,
            year_code,
            semester,
            department,
            division,
            belongs_to_committee,
            committee_name,
            committee_role
        } = req.body;

        const teacherInfo = {
            role_type: role_type || "Class Teacher",
            academic_year: academic_year || "2024-2025",
            year_code: year_code || "FE",
            semester: Number(semester || 1),
            department: department || "Computer Science",
            division: division || "A",
            belongs_to_committee: Boolean(belongs_to_committee),
            committee_name: belongs_to_committee ? (committee_name || "Students") : "",
            committee_role: belongs_to_committee ? (committee_role || "Member") : ""
        };

        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.user.id,
            { teacher_info: teacherInfo },
            { new: true }
        ).select("-password");

        res.status(200).json({
            message: "Teacher role setup & committee updated successfully",
            teacher_info: updatedAdmin.teacher_info
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current teacher profile & setup
router.get("/profile", protect, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select("-password");
        if (!admin) return res.status(404).json({ message: "Teacher account not found" });

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get students for assigned class & division
router.get("/students", protect, async (req, res) => {
    try {
        const { department, year_code, academic_year, division, semester } = req.query;

        let deptRegex = null;
        if (department) {
            if (/computer/i.test(department)) deptRegex = new RegExp("Computer", "i");
            else if (/information|it/i.test(department)) deptRegex = new RegExp("Information|IT", "i");
            else if (/electronics|extc/i.test(department)) deptRegex = new RegExp("Electronics|EXTC", "i");
            else if (/mechanical/i.test(department)) deptRegex = new RegExp("Mechanical", "i");
            else if (/ai|data/i.test(department)) deptRegex = new RegExp("AI|Data|Computer", "i");
            else deptRegex = new RegExp(department, "i");
        }

        // Stage 1: Exact match on all filters
        let query = {};
        if (deptRegex) query.department = deptRegex;
        if (year_code) query.year_code = year_code;
        if (academic_year) query.academic_year = academic_year;
        if (division) query.division = division;

        let students = await Student.find(query).sort({ admission_no: 1 });

        // Stage 2: Relax academic_year
        if (students.length === 0 && academic_year) {
            delete query.academic_year;
            students = await Student.find(query).sort({ admission_no: 1 });
        }

        // Stage 3: Relax division
        if (students.length === 0 && division) {
            delete query.division;
            students = await Student.find(query).sort({ admission_no: 1 });
        }

        // Stage 4: Relax year_code
        if (students.length === 0 && year_code) {
            delete query.year_code;
            students = await Student.find(query).sort({ admission_no: 1 });
        }

        // Stage 5: Return all students in DB if still empty
        if (students.length === 0) {
            students = await Student.find().sort({ admission_no: 1 });
        }

        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update single or bulk student assessments & attendance
router.post("/update-assessment", protect, async (req, res) => {
    try {
        const { assessments } = req.body; // Array of assessment items

        if (!Array.isArray(assessments) || assessments.length === 0) {
            return res.status(400).json({ message: "Invalid assessment payload" });
        }

        const savedRecords = [];

        for (const item of assessments) {
            const record = await Assessment.findOneAndUpdate(
                {
                    student_id: item.student_id,
                    academic_year: item.academic_year || "2024-2025",
                    semester: Number(item.semester || 1),
                    subject_name: item.subject_name || "General Course"
                },
                {
                    student_id: item.student_id,
                    academic_year: item.academic_year || "2024-2025",
                    year_code: item.year_code || "FE",
                    semester: Number(item.semester || 1),
                    department: item.department || "Computer Science",
                    division: item.division || "A",
                    subject_name: item.subject_name || "General Course",
                    ia1_marks: Number(item.ia1_marks || 0),
                    ia2_marks: Number(item.ia2_marks || 0),
                    lecture_attendance_present: Number(item.lecture_attendance_present || 0),
                    lecture_attendance_total: Number(item.lecture_attendance_total || 40),
                    practical_attendance_present: Number(item.practical_attendance_present || 0),
                    practical_attendance_total: Number(item.practical_attendance_total || 20),
                    updated_by: req.user.id
                },
                { upsert: true, new: true }
            );

            savedRecords.push(record);
        }

        res.status(200).json({
            message: "Student assessments & attendance updated successfully",
            total_records: savedRecords.length,
            records: savedRecords
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// AI Document Upload for Teacher (PDF, XLS, JPEG/PNG Image)
router.post("/upload-assessment-file", protect, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a document or image file (.pdf, .xlsx, .jpg, .png)" });
        }

        const { academic_year, year_code, semester, department, division, subject_name } = req.body;
        const filePath = req.file.path;
        const mimeType = req.file.mimetype || "";

        const metaData = {
            academic_year: academic_year || "2024-2025",
            year_code: year_code || "FE",
            semester: Number(semester || 1),
            department: department || "Computer Science",
            division: division || "A",
            subject_name: subject_name || "General Course"
        };

        const aiResult = await parseTeacherFile(filePath, mimeType, metaData);
        const processedRecords = [];

        for (const item of aiResult.assessments) {
            const record = await Assessment.findOneAndUpdate(
                {
                    student_id: item.student_id,
                    academic_year: metaData.academic_year,
                    semester: metaData.semester,
                    subject_name: metaData.subject_name
                },
                {
                    ...item,
                    updated_by: req.user.id
                },
                { upsert: true, new: true }
            );

            processedRecords.push(record);
        }

        // Cleanup uploaded file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(201).json({
            message: "File processed successfully by AI parser",
            total_students_processed: processedRecords.length,
            metaData,
            records: processedRecords
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetch saved assessments for class & division
router.get("/assessments", protect, async (req, res) => {
    try {
        const { academic_year, year_code, semester, department, division, subject_name } = req.query;

        const query = {};
        if (academic_year) query.academic_year = academic_year;
        if (year_code) query.year_code = year_code;
        if (semester) query.semester = Number(semester);
        if (department) query.department = department;
        if (division) query.division = division;
        if (subject_name) query.subject_name = subject_name;

        const records = await Assessment.find(query).populate("student_id").sort({ updatedAt: -1 });

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
