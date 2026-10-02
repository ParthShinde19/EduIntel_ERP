const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const bwipjs = require("bwip-js");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const protect = require("../middleware/authMiddleware");

// Generate ID Card PDF
router.get("/generate/:id", protect, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Barcode generation
        const barcodeBuffer = await bwipjs.toBuffer({
            bcid: "code128",
            text: student.admission_no || "N/A",
            scale: 3,
            height: 10
        });

        // File path
        const filePath = path.join(
            __dirname,
            `../idcards/${student.admission_no}.pdf`
        );

        // Create PDF
        const doc = new PDFDocument({
            size: [350, 220],
            margin: 10
        });

        doc.pipe(fs.createWriteStream(filePath));

        // Outer Border
        doc.rect(5, 5, 340, 210).stroke();

        // Header
        doc.image(
            path.join(__dirname, "../header_footer/header.png"),
            10,
            10,
            { width: 330 }
        );

        // Photo Box
        doc.rect(20, 60, 70, 85).stroke();

        if (student.photo) {
            doc.image(
                student.photo,
                22,
                62,
                {
                    width: 66,
                    height: 81
                }
            );
        } else {
            doc.fontSize(10).text("PHOTO", 35, 95);
        }

        // Title
        doc.fontSize(14)
            .text("STUDENT IDENTITY CARD", 105, 65);

        // Student Details
        doc.fontSize(10)
            .text(
                `Name: ${student.first_name || ""} ${student.surname || ""}`,
                105,
                90
            )
            .text(
                `Father Name: ${student.father_name || "N/A"}`,
                105,
                108
            )
            .text(
                `Admission No: ${student.admission_no || "N/A"}`,
                105,
                126
            )
            .text(
                `PNR No: ${student.pnr_no || "N/A"}`,
                105,
                144
            )
            .text(
                `GR No: ${student.gr_no || "N/A"}`,
                105,
                162
            );

        // Barcode
        doc.image(barcodeBuffer, 20, 155, {
            width: 120
        });

        // Validity
        doc.fontSize(9)
            .text(
                `Valid Upto: ${
                    student.valid_upto || "Not Assigned"
                }`,
                170,
                180
            );

        // Signature
        doc.text(
            "Authorized Signature",
            230,
            195
        );

        // Footer
        doc.image(
            path.join(__dirname, "../header_footer/footer.png"),
            10,
            200,
            { width: 330 }
        );

        doc.end();

        res.status(200).json({
            message: "ID Card generated successfully",
            file: filePath
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;