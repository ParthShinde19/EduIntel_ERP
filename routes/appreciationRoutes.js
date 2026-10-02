const express = require("express");
const router = express.Router();
const Committee = require("../models/Committee");
const Student = require("../models/Student");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const protect = require("../middleware/authMiddleware");

router.get("/generate/:studentId", protect, async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const committees = await Committee.find({
            student_id: req.params.studentId
        });

        if (committees.length === 0) {
            return res.status(404).json({
                message: "No committee records found"
            });
        }

        const filePath = path.join(
            __dirname,
            `../letters/${student.admission_no}_appreciation.pdf`
        );

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(20).text("Letter of Appreciation", {
            align: "center"
        });

        doc.moveDown();

        doc.fontSize(12).text(
            `This is to certify that ${student.first_name} ${student.surname} has actively served in various college committees with dedication and responsibility.`
        );

        doc.moveDown();

        committees.forEach((c, index) => {
            doc.text(`${index + 1}. Committee: ${c.committee_name}`);
            doc.text(`Position: ${c.position}`);
            doc.text(`Tenure: ${c.tenure_start} to ${c.tenure_end || "Present"}`);
            doc.text(`Tasks: ${c.tasks.join(", ")}`);
            doc.text(`Achievements: ${c.achievements.join(", ")}`);
            doc.moveDown();
        });

        doc.moveDown();

        doc.text("We appreciate the student's valuable contribution to the institution.");

        doc.end();

        res.status(200).json({
            message: "Appreciation letter generated successfully",
            file: filePath
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;