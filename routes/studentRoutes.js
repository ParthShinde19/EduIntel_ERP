const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const XLSX = require("xlsx");

const upload = multer({ dest: "uploads/" });


// Add Student (Protected)
router.post("/add", protect, async (req, res) => {
    try {
        const { email, roll_number } = req.body;

        const existingStudent = await Student.findOne({
            $or: [
                { email },
                { roll_number }
            ]
        });

        if (existingStudent) {
            return res.status(400).json({
                message: "Student already exists"
            });
        }

        const student = new Student(req.body);
        await student.save();

        res.status(201).json({
            message: "Student added successfully",
            student
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Bulk Upload Students (Excel / CSV / PDF)
router.post("/upload", protect, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload an Excel or CSV file" });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const processedStudents = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const keys = Object.keys(row);

            let admission_no = row.admission_no || row.AdmissionNo || row["Admission No"] || row["ADM"];
            let gr_no = row.gr_no || row.GRNo || row["GR No"] || row["UID"];
            let pnr_no = row.pnr_no || row.PNR || row["PNR No"] || row["PRN"];
            let fullNameStr = row.full_name || row.FullName || row["Full Name"] || row.student_name || row.Name || row["Student Name"] || row.name;

            // Position-based fallback
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
                    father_name: row.father_name || `${surname} Parent`,
                    dob: row.dob ? new Date(row.dob) : new Date("2004-01-01"),
                    email: row.email || `${firstName.toLowerCase()}.${surname.toLowerCase()}${i}@smartcampus.edu`,
                    phone: row.phone || "9876543210",
                    course: row.course || "B.Tech Engineering",
                    department: row.department || "Computer Science",
                    year_code: row.year_code || "FE",
                    division: row.division || "A",
                    academic_year: row.academic_year || "2026-2027",
                    current_semester: Number(row.semester || 1),
                    status: "active"
                },
                { upsert: true, new: true }
            );

            processedStudents.push(student);
        }

        res.status(201).json({
            message: "All student records from file committed automatically to database!",
            total_students: processedStudents.length,
            students: processedStudents
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get All Students
router.get("/all", async (req, res) => {
    try {
        const students = await Student.find();

        res.status(200).json(students);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get Single Student
router.get("/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json(student);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Update Student (Admin)
router.put("/update/:id", protect, async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student updated successfully",
            updatedStudent
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Student Profile Update
router.put("/profile/:id", protect, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            message: "Profile updated successfully",
            student
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Delete Student
router.delete("/delete/:id", protect, async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(
            req.params.id
        );

        if (!deletedStudent) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;