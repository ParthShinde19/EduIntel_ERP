const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");
const protect = require("../middleware/authMiddleware");
const generatePDF = require("../utils/pdfTemplate");
const path = require("path");


// Issue certificate
router.post("/issue", protect, async (req, res) => {
    try {
        const certificate = new Certificate(req.body);
        await certificate.save();

        const fileName =
            `certificate_${certificate._id}.pdf`;

        const outputPath = path.join(
            __dirname,
            "../generated_pdfs",
            fileName
        );

        const content = `
This is to certify that ${
    req.body.student_name
} has successfully participated in ${
    req.body.event_name
}.

Certificate Type: ${
    req.body.certificate_type
}

Issued on: ${new Date().toDateString()}
Reference ID: ${certificate._id}
`;

        await generatePDF(
            "Certificate of Appreciation",
            content,
            outputPath
        );

        certificate.pdf_path = outputPath;
        await certificate.save();

        res.status(201).json({
            message: "Certificate issued successfully",
            certificate,
            pdf: outputPath
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get all certificates
router.get("/all", protect, async (req, res) => {
    try {
        const certificates = await Certificate.find()
            .populate("student_id");

        res.status(200).json(certificates);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get student certificates
router.get("/student/:studentId", protect, async (req, res) => {
    try {
        const certificates = await Certificate.find({
            student_id: req.params.studentId
        });

        res.status(200).json(certificates);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;