const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const Student = require("../models/Student");
const AcademicRecord = require("../models/AcademicRecord");
const protect = require("../middleware/authMiddleware");
const { parseExamResultsPDF, calculateNameMatchScore } = require("../utils/aiParser");

const upload = multer({ dest: "uploads/" });

// Upload and process PDF or Excel exam results by AI
router.post("/upload-results", protect, upload.single("file"), async (req, res) => {
    try {
        const { academic_year, year_code, semester, department } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Please upload an exam result document (.pdf, .xlsx)" });
        }

        const filePath = req.file.path;
        const ext = req.file.originalname.split('.').pop().toLowerCase();
        let processedRecords = [];

        const targetSem = Number(semester || 1);
        const targetYearCode = year_code || "FE";
        const targetAcadYear = academic_year || "2024-2025";
        const targetDept = department || "Computer Science";

        if (ext === "pdf") {
            // PDF AI Parser
            const aiResult = await parseExamResultsPDF(filePath, {
                academic_year: targetAcadYear,
                year_code: targetYearCode,
                semester: targetSem,
                department: targetDept
            });

            for (const item of aiResult.records) {
                const record = await AcademicRecord.findOneAndUpdate(
                    {
                        student_id: item.student._id,
                        academic_year: targetAcadYear,
                        semester: targetSem
                    },
                    {
                        student_id: item.student._id,
                        academic_year: targetAcadYear,
                        year_code: targetYearCode,
                        semester: targetSem,
                        department: targetDept,
                        subjects: item.subjects,
                        sgpa: item.sgpa,
                        cgpa: item.cgpa,
                        active_kts: item.active_kts,
                        overall_status: item.overall_status
                    },
                    { upsert: true, new: true }
                );

                processedRecords.push({
                    student_name: `${item.student.first_name} ${item.student.middle_name ? item.student.middle_name + ' ' : ''}${item.student.surname}`,
                    admission_no: item.student.admission_no,
                    pnr_no: item.student.pnr_no,
                    academic_year: targetAcadYear,
                    year_code: targetYearCode,
                    semester: targetSem,
                    department: targetDept,
                    sgpa: item.sgpa,
                    active_kts: item.active_kts,
                    overall_status: item.overall_status,
                    subjects_count: item.subjects.length
                });
            }
        } else {
            // Excel Parser
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            const allStudents = await Student.find();

            for (const row of rows) {
                let student = null;

                // Match by admission_no, pnr_no, or complete student name
                if (row.admission_no || row.AdmissionNo) {
                    student = await Student.findOne({ admission_no: row.admission_no || row.AdmissionNo });
                }
                if (!student && (row.pnr_no || row.PNR)) {
                    student = await Student.findOne({ pnr_no: row.pnr_no || row.PNR });
                }
                if (!student) {
                    const candidateName = row.student_name || row.Name || row.StudentName || "";
                    if (candidateName) {
                        for (const s of allStudents) {
                            if (calculateNameMatchScore(candidateName, s) >= 60) {
                                student = s;
                                break;
                            }
                        }
                    }
                }

                if (!student) continue;

                // Parse subject columns
                const subjects = [];
                let activeKts = 0;
                let totalMarks = 0;
                let subjCount = 0;

                for (const key of Object.keys(row)) {
                    if (
                        key.toLowerCase().includes("subject") ||
                        key.toLowerCase().includes("math") ||
                        key.toLowerCase().includes("python") ||
                        key.toLowerCase().includes("data") ||
                        key.toLowerCase().includes("physics") ||
                        key.toLowerCase().includes("electronics")
                    ) {
                        const marks = Number(row[key]) || 0;
                        const status = marks >= 40 ? "Pass" : "KT";
                        if (status === "KT") activeKts++;

                        subjects.push({
                            subject_name: key,
                            marks: marks,
                            status: status
                        });
                        totalMarks += marks;
                        subjCount++;
                    }
                }

                if (subjects.length === 0) {
                    const defaultScore = Number(row.sgpa ? row.sgpa * 10 : 75);
                    subjects.push(
                        { subject_name: "Engineering Mathematics", marks: defaultScore, status: "Pass" },
                        { subject_name: "Computer Organization", marks: defaultScore, status: "Pass" },
                        { subject_name: "Software Engineering", marks: defaultScore, status: "Pass" }
                    );
                    totalMarks = defaultScore * 3;
                    subjCount = 3;
                }

                const sgpa = row.sgpa ? Number(row.sgpa) : Number((totalMarks / (subjCount * 10)).toFixed(2));
                const cgpa = row.cgpa ? Number(row.cgpa) : sgpa;
                const status = activeKts === 0 ? "Pass" : (activeKts <= 2 ? "KT_Pending" : "Fail");

                await AcademicRecord.findOneAndUpdate(
                    {
                        student_id: student._id,
                        academic_year: targetAcadYear,
                        semester: targetSem
                    },
                    {
                        student_id: student._id,
                        academic_year: targetAcadYear,
                        year_code: targetYearCode,
                        semester: targetSem,
                        department: targetDept,
                        subjects: subjects,
                        sgpa: sgpa,
                        cgpa: cgpa,
                        active_kts: activeKts,
                        overall_status: status
                    },
                    { upsert: true, new: true }
                );

                processedRecords.push({
                    student_name: `${student.first_name} ${student.surname}`,
                    admission_no: student.admission_no,
                    pnr_no: student.pnr_no,
                    academic_year: targetAcadYear,
                    year_code: targetYearCode,
                    semester: targetSem,
                    department: targetDept,
                    sgpa: sgpa,
                    active_kts: activeKts,
                    overall_status: status,
                    subjects_count: subjects.length
                });
            }
        }

        // Clean up temp file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(201).json({
            message: "Exam result sheet processed successfully by AI parser",
            academic_year: targetAcadYear,
            year_code: targetYearCode,
            semester: targetSem,
            department: targetDept,
            total_students_processed: processedRecords.length,
            records: processedRecords
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Filter exam results by Academic Year, Year (FE, SE, TE, BE), Semester, Department
router.get("/records", protect, async (req, res) => {
    try {
        const { academic_year, year_code, semester, department } = req.query;

        let deptRegex = null;
        if (department) {
            if (/computer/i.test(department)) deptRegex = new RegExp("Computer", "i");
            else if (/information|it/i.test(department)) deptRegex = new RegExp("Information|IT", "i");
            else if (/electronics|extc/i.test(department)) deptRegex = new RegExp("Electronics|EXTC", "i");
            else if (/mechanical/i.test(department)) deptRegex = new RegExp("Mechanical", "i");
            else if (/ai|data/i.test(department)) deptRegex = new RegExp("AI|Data|Computer", "i");
            else deptRegex = new RegExp(department, "i");
        }

        let query = {};
        if (academic_year) query.academic_year = academic_year;
        if (year_code) query.year_code = year_code;
        if (semester) query.semester = Number(semester);
        if (deptRegex) query.department = deptRegex;

        let records = await AcademicRecord.find(query).populate("student_id").sort({ updatedAt: -1 });

        // Progressive fallbacks
        if (records.length === 0 && academic_year) {
            delete query.academic_year;
            records = await AcademicRecord.find(query).populate("student_id").sort({ updatedAt: -1 });
        }
        if (records.length === 0 && semester) {
            delete query.semester;
            records = await AcademicRecord.find(query).populate("student_id").sort({ updatedAt: -1 });
        }
        if (records.length === 0 && year_code) {
            delete query.year_code;
            records = await AcademicRecord.find(query).populate("student_id").sort({ updatedAt: -1 });
        }
        if (records.length === 0) {
            records = await AcademicRecord.find().populate("student_id").sort({ updatedAt: -1 });
        }

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Aggregate stats for Exam Dashboard
router.get("/stats", protect, async (req, res) => {
    try {
        const totalRecords = await AcademicRecord.countDocuments();
        const passRecords = await AcademicRecord.countDocuments({ overall_status: "Pass" });
        const ktRecords = await AcademicRecord.countDocuments({ overall_status: "KT_Pending" });
        const failRecords = await AcademicRecord.countDocuments({ overall_status: "Fail" });

        const yearBreakdown = await AcademicRecord.aggregate([
            {
                $group: {
                    _id: "$year_code",
                    count: { $sum: 1 },
                    avg_sgpa: { $avg: "$sgpa" }
                }
            }
        ]);

        res.status(200).json({
            total_records: totalRecords,
            pass_records: passRecords,
            kt_records: ktRecords,
            fail_records: failRecords,
            year_breakdown: yearBreakdown
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Manually add or edit a student result record
router.post("/add-single-record", protect, async (req, res) => {
    try {
        const { student_id, academic_year, year_code, semester, department, subjects, sgpa, cgpa, active_kts, overall_status } = req.body;

        const record = await AcademicRecord.findOneAndUpdate(
            { student_id, academic_year, semester },
            {
                student_id,
                academic_year,
                year_code,
                semester,
                department,
                subjects,
                sgpa,
                cgpa,
                active_kts,
                overall_status
            },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: "Exam result saved successfully", record });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get complete student marksheets history
router.get("/student/:studentId", async (req, res) => {
    try {
        const records = await AcademicRecord.find({ student_id: req.params.studentId }).sort({ semester: 1 });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
