const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const Batch = require("../models/Batch");
const Student = require("../models/Student");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { executeAnnualPromotion } = require("../utils/promotionEngine");

const upload = multer({ dest: "uploads/" });

// Create Year-Wise Academic Batch (Admission Admin)
router.post("/create", optionalProtect, async (req, res) => {
    try {
        const { academic_year, department, year_code, section } = req.body;

        const batch_name = `${academic_year}-${year_code || 'FE'}-${department.replace(/\s+/g, '')}-${section || 'A'}`;

        const existing = await Batch.findOne({ batch_name });
        if (existing) {
            return res.status(400).json({ message: "Batch already exists with this name: " + batch_name });
        }

        const batch = new Batch({
            academic_year,
            department,
            year_code: year_code || "FE",
            batch_name,
            section: section || "A"
        });

        await batch.save();

        res.status(201).json({
            message: "Academic Batch created successfully",
            batch
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Batches
router.get("/all", optionalProtect, async (req, res) => {
    try {
        let batches = await Batch.find().sort({ createdAt: -1 });

        if (batches.length === 0) {
            const defaultBatches = [
                { academic_year: "2024-2025", department: "Computer Science", year_code: "FE", batch_name: "2024-2025-FE-CS-A", section: "A", student_count: 12 },
                { academic_year: "2024-2025", department: "Information Technology", year_code: "SE", batch_name: "2024-2025-SE-IT-A", section: "A", student_count: 10 },
                { academic_year: "2024-2025", department: "Electronics & Telecom", year_code: "TE", batch_name: "2024-2025-TE-EXTC-A", section: "A", student_count: 8 },
                { academic_year: "2024-2025", department: "Computer Science", year_code: "BE", batch_name: "2024-2025-BE-CS-A", section: "A", student_count: 15 }
            ];
            batches = await Batch.insertMany(defaultBatches);
        }

        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const pdfParse = require("pdf-parse");
const fs = require("fs");

// Bulk Upload Students for Batch (Excel / PDF parser)
router.post("/upload-students", optionalProtect, upload.single("file"), async (req, res) => {
    try {
        const { batch_id, academic_year, year_code, department } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Please upload an Excel (.xlsx) or PDF file" });
        }

        const ext = req.file.originalname.split('.').pop().toLowerCase();
        let rows = [];

        if (ext === "pdf") {
            const dataBuffer = fs.readFileSync(req.file.path);
            const parsedPdf = await pdfParse(dataBuffer);
            const rawText = parsedPdf.text || "";
            const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.length > 5 && !line.toLowerCase().includes("page") && !line.toLowerCase().includes("academic")) {
                    rows.push({ full_name: line });
                }
            }
        } else {
            const workbook = XLSX.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }

        const batch = batch_id ? await Batch.findById(batch_id) : null;
        const currentBatchName = batch ? batch.batch_name : `${academic_year || '2024-2025'}-${year_code || 'FE'}-${(department || 'CS').replace(/\s+/g, '')}-A`;

        const insertedStudents = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const keys = Object.keys(row);

            // Smart field extraction for Admission No, GR No, PNR No, and Full Name
            let admission_no = row.admission_no || row.AdmissionNo || row["Admission No"] || row["ADM"];
            let gr_no = row.gr_no || row.GRNo || row["GR No"] || row["UID"] || row["gr_no"];
            let pnr_no = row.pnr_no || row.PNR || row["PNR No"] || row["PRN"];
            let fullNameStr = row.full_name || row.FullName || row["Full Name"] || row.student_name || row.Name || row["Student Name"];

            // Position-based fallback if headers are unnamed (e.g. __EMPTY, Col 1, Col 2)
            if (!admission_no && keys[0]) admission_no = String(row[keys[0]]);
            if (!gr_no && keys[1]) gr_no = String(row[keys[1]]);
            if (!pnr_no && keys[2]) pnr_no = String(row[keys[2]]);
            if (!fullNameStr && keys[3]) fullNameStr = String(row[keys[3]]);

            admission_no = admission_no || `ADM${Date.now()}${i}`;
            pnr_no = pnr_no || `PNR${Date.now()}${i}`;
            gr_no = gr_no || `UID${100 + i}`;

            let firstName = row.first_name || row.FirstName || "Student";
            let surname = row.surname || row.LastName || "User";
            let middleName = row.middle_name || row.MiddleName || "";

            if (fullNameStr && fullNameStr !== "Student User") {
                const parts = String(fullNameStr).trim().split(/\s+/);
                firstName = parts[0] || firstName;
                if (parts.length > 1) surname = parts[parts.length - 1];
                if (parts.length > 2) middleName = parts.slice(1, -1).join(" ");
            }

            const student = await Student.findOneAndUpdate(
                { admission_no },
                {
                    admission_no,
                    pnr_no,
                    gr_no,
                    first_name: firstName,
                    middle_name: middleName,
                    surname: surname,
                    father_name: row.father_name || row.FatherName || `${surname} Parent`,
                    dob: row.dob ? new Date(row.dob) : new Date("2004-01-01"),
                    gender: row.gender || "Male",
                    email: row.email || `${firstName.toLowerCase()}.${surname.toLowerCase()}${i}@campus.edu`,
                    phone: row.phone || "9876543210",
                    blood_group: row.blood_group || "O+",
                    emergency_contact: row.emergency_contact || "9876543211",
                    residential_address: row.residential_address || row.address || "Campus Hostel, Block A",
                    parent_phone: row.parent_phone || "9876543212",
                    parent_address: row.parent_address || row.address || "Campus Hostel, Block A",
                    course: row.course || "B.Tech Engineering",
                    department: department || row.department || "Computer Science",
                    academic_year: academic_year || "2026-2027",
                    year_code: year_code || "FE",
                    division: row.division || "A",
                    current_year: year_code === "FE" ? 1 : (year_code === "SE" ? 2 : (year_code === "TE" ? 3 : 4)),
                    current_semester: year_code === "FE" ? 1 : (year_code === "SE" ? 3 : (year_code === "TE" ? 5 : 7)),
                    batch_id: batch ? batch._id : null,
                    batch_name: currentBatchName,
                    status: "active"
                },
                { upsert: true, new: true }
            );

            insertedStudents.push(student);
        }

        if (batch) {
            await Batch.findByIdAndUpdate(batch._id, {
                student_count: (batch.student_count || 0) + insertedStudents.length
            });
        }

        res.status(201).json({
            message: "Batch student records processed successfully",
            batch_name: currentBatchName,
            total_processed: insertedStudents.length,
            students: insertedStudents
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Trigger Annual July 10th Batch Promotion Manual Run
router.post("/promote-now", optionalProtect, async (req, res) => {
    try {
        const result = await executeAnnualPromotion();
        res.status(200).json({
            message: "Annual July 10 Batch Promotion executed successfully!",
            result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

