const express = require("express");
const router = express.Router();
const NSSVolunteer = require("../models/NSSVolunteer");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const XLSX = require("xlsx");


// Upload Excel and import volunteers
router.post(
    "/upload",
    protect,
    upload.single("file"),
    async (req, res) => {
        try {
            const workbook = XLSX.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const data = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheetName]
            );

            const formattedData = [];

            for (const row of data) {
                const existing = await NSSVolunteer.findOne({
                    roll_no: row["Roll No"]
                });

                if (!existing) {
                    formattedData.push({
                        name: row.Name,
                        roll_no: row["Roll No"],
                        department: row.Department,
                        year: row.Year,
                        phone: row.Phone,
                        email: row.Email,
                        hours_completed:
                            row["Hours Completed"] || 0,
                        camp_attended:
                            row["Camp Attended"] || false,
                        blood_donation:
                            row["Blood Donation"] || false,
                        role: row.Role || "Volunteer"
                    });
                }
            }

            await NSSVolunteer.insertMany(formattedData);

            res.status(201).json({
                message: "NSS volunteers uploaded successfully",
                total_records: formattedData.length
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);


// Get all volunteers
router.get("/all", async (req, res) => {
    try {
        const volunteers = await NSSVolunteer.find();

        res.status(200).json(volunteers);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get single volunteer
router.get("/:id", async (req, res) => {
    try {
        const volunteer = await NSSVolunteer.findById(
            req.params.id
        );

        if (!volunteer) {
            return res.status(404).json({
                message: "Volunteer not found"
            });
        }

        res.status(200).json(volunteer);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Volunteer hours aggregation
router.get("/hours/:id", async (req, res) => {
    try {
        const volunteer = await NSSVolunteer.findById(
            req.params.id
        );

        if (!volunteer) {
            return res.status(404).json({
                message: "Volunteer not found"
            });
        }

        res.status(200).json({
            name: volunteer.name,
            total_hours: volunteer.hours_completed,
            camp_attended: volunteer.camp_attended,
            blood_donation: volunteer.blood_donation
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Update volunteer
router.put("/update/:id", protect, async (req, res) => {
    try {
        const updated = await NSSVolunteer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            message: "Volunteer updated successfully",
            updated
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;