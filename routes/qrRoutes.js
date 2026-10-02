const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const Student = require("../models/Student");
const RiskAssessment = require("../models/RiskAssessment");
const { protect, optionalProtect } = require("../middleware/authMiddleware");

// Generate Dynamic QR identity token & barcode Data URL
router.get("/generate/:studentId", optionalProtect, async (req, res) => {

    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const payload = {
            student_id: student._id,
            admission_no: student.admission_no,
            pnr_no: student.pnr_no,
            name: `${student.first_name} ${student.surname}`,
            course: student.course,
            department: student.department
        };

        // Sign token with 30 day expiration for dynamic digital identity
        const qrToken = jwt.sign(payload, process.env.JWT_SECRET || "smartcampus_secret", {
            expiresIn: "30d"
        });

        // Verification URL
        const verifyUrl = `http://localhost:5173/verify/student/${qrToken}`;

        // Render QR Code as PNG Base64 Data URL
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
            errorCorrectionLevel: "H",
            margin: 2,
            color: {
                dark: "#1e293b",
                light: "#ffffff"
            }
        });

        res.status(200).json({
            student_id: student._id,
            admission_no: student.admission_no,
            qr_token: qrToken,
            verify_url: verifyUrl,
            qr_image: qrDataUrl
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify QR Token (Public / Role-gated Verification Route)
router.get("/verify/:token", async (req, res) => {
    try {
        const token = req.params.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "smartcampus_secret");

        const student = await Student.findById(decoded.student_id);
        if (!student) {
            return res.status(404).json({ message: "Student record not found or expired" });
        }

        const risk = await RiskAssessment.findOne({ student_id: student._id });

        res.status(200).json({
            status: "VALID_DIGITAL_ID",
            verified_at: new Date(),
            student: {
                id: student._id,
                admission_no: student.admission_no,
                pnr_no: student.pnr_no,
                first_name: student.first_name,
                middle_name: student.middle_name,
                surname: student.surname,
                father_name: student.father_name,
                dob: student.dob,
                gender: student.gender,
                course: student.course,
                department: student.department,
                current_year: student.current_year,
                status: student.status,
                valid_upto: student.valid_upto,
                photo: student.photo
            },
            academic_risk_badge: risk ? {
                risk_score: risk.risk_score,
                risk_level: risk.risk_level,
                last_assessed: risk.last_assessed
            } : null
        });

    } catch (error) {
        res.status(401).json({
            status: "INVALID_OR_EXPIRED_ID",
            message: "The scanned QR token is invalid or has expired.",
            error: error.message
        });
    }
});

module.exports = router;
