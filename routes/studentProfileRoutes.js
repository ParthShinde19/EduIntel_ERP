const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const AcademicRecord = require("../models/AcademicRecord");
const Attendance = require("../models/Attendance");
const Borrow = require("../models/Borrow");
const RiskAssessment = require("../models/RiskAssessment");
const { optionalProtect } = require("../middleware/authMiddleware");

// Consolidated Student Dossier Endpoint
router.get("/:studentId", optionalProtect, async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            return res.status(404).json({ message: "Student record not found" });
        }

        // 1. Admission Details
        const admissionSection = {
            admission_no: student.admission_no,
            pnr_no: student.pnr_no,
            gr_no: student.gr_no || "N/A",
            academic_year: student.academic_year || "2024-2025",
            year_code: student.year_code || "FE",
            current_year: student.current_year || 1,
            current_semester: student.current_semester || 1,
            batch_name: student.batch_name || "FE-Engineering-A",
            course: student.course || "B.Tech Engineering",
            department: student.department || "Computer Science",
            status: student.status
        };

        // 2. Exam Department Marks & Results (AI Ingested)
        const academicRecords = await AcademicRecord.find({ student_id: student._id }).sort({ semester: 1 });

        // 3. Library Section
        const libraryRecords = await Borrow.find({ student_id: student._id }).populate("book_id").sort({ createdAt: -1 });
        const activeBorrows = libraryRecords.filter(r => r.status === "Borrowed" || r.status === "Issued");
        const overdueBorrows = activeBorrows.filter(r => r.due_date && new Date(r.due_date) < new Date());
        const eligibleToBorrow = activeBorrows.length < 3 && overdueBorrows.length === 0;

        const librarySection = {
            currently_borrowed: activeBorrows.length,
            max_limit: 3,
            has_overdue: overdueBorrows.length > 0,
            eligible_to_borrow: eligibleToBorrow,
            records: libraryRecords
        };

        // 4. Attendance Section
        const totalClasses = await Attendance.countDocuments({ student_id: student._id });
        const presentClasses = await Attendance.countDocuments({ student_id: student._id, status: "Present" });
        const percentage = totalClasses > 0 ? Number(((presentClasses / totalClasses) * 100).toFixed(1)) : 85.0;

        const attendanceSection = {
            total_classes: totalClasses,
            present_classes: presentClasses,
            absent_classes: totalClasses - presentClasses,
            attendance_percentage: percentage
        };

        // 5. AI Risk Assessment Section
        const riskAssessment = await RiskAssessment.findOne({ student_id: student._id });

        res.status(200).json({
            student: {
                id: student._id,
                name: `${student.first_name} ${student.surname}`,
                first_name: student.first_name,
                middle_name: student.middle_name,
                surname: student.surname,
                father_name: student.father_name,
                dob: student.dob,
                gender: student.gender,
                phone: student.phone,
                email: student.email,
                blood_group: student.blood_group || "O+",
                emergency_contact: student.emergency_contact || "N/A",
                residential_address: student.residential_address || "N/A",
                parent_phone: student.parent_phone || "N/A",
                parent_address: student.parent_address || "N/A",
                photo: student.photo
            },
            admission_section: admissionSection,
            exam_section: academicRecords,
            library_section: librarySection,
            attendance_section: attendanceSection,
            risk_section: riskAssessment
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Editable Parents' Details Update
router.put("/update-parents/:studentId", optionalProtect, async (req, res) => {
    try {
        const { parent_phone, parent_address } = req.body;

        const student = await Student.findByIdAndUpdate(
            req.params.studentId,
            {
                parent_phone: parent_phone,
                parent_address: parent_address
            },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({
            message: "Parents' details updated successfully",
            parent_phone: student.parent_phone,
            parent_address: student.parent_address
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
