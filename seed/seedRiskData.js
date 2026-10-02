const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Student = require("../models/Student");
const AcademicRecord = require("../models/AcademicRecord");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const RiskAssessment = require("../models/RiskAssessment");
const connectDB = require("../config/db");

const sampleStudents = [
    {
        admission_no: "ADM202401",
        pnr_no: "PNR9901",
        gr_no: "GR001",
        first_name: "Rahul",
        surname: "Sharma",
        father_name: "Ramesh Sharma",
        dob: new Date("2003-05-14"),
        email: "rahul.sharma@campus.edu",
        course: "B.Tech",
        department: "Computer Science",
        admission_year: 2022,
        current_year: 3,
        current_semester: 5,
        status: "active",
        valid_upto: new Date("2026-06-30")
    },
    {
        admission_no: "ADM202402",
        pnr_no: "PNR9902",
        gr_no: "GR002",
        first_name: "Priya",
        surname: "Patel",
        father_name: "Suresh Patel",
        dob: new Date("2003-08-22"),
        email: "priya.patel@campus.edu",
        course: "B.Tech",
        department: "Information Technology",
        admission_year: 2022,
        current_year: 3,
        current_semester: 5,
        status: "active",
        valid_upto: new Date("2026-06-30")
    },
    {
        admission_no: "ADM202403",
        pnr_no: "PNR9903",
        gr_no: "GR003",
        first_name: "Amit",
        surname: "Verma",
        father_name: "Vijay Verma",
        dob: new Date("2002-11-10"),
        email: "amit.verma@campus.edu",
        course: "B.Tech",
        department: "Electronics",
        admission_year: 2021,
        current_year: 4,
        current_semester: 7,
        status: "active",
        valid_upto: new Date("2025-06-30")
    }
];

const seedRiskData = async () => {
    try {
        await connectDB();
        console.log("Connected to MongoDB for seeding...");

        for (const sData of sampleStudents) {
            let student = await Student.findOne({ admission_no: sData.admission_no });
            if (!student) {
                student = new Student(sData);
                await student.save();
                console.log(`Created student: ${student.first_name} ${student.surname}`);
            }

            // Create longitudinal academic record
            let academic = await AcademicRecord.findOne({ student_id: student._id });
            if (!academic) {
                academic = new AcademicRecord({
                    student_id: student._id,
                    semester: student.current_semester,
                    sgpa: student.admission_no === "ADM202401" ? 8.2 : (student.admission_no === "ADM202402" ? 5.4 : 4.2),
                    cgpa: student.admission_no === "ADM202401" ? 8.5 : (student.admission_no === "ADM202402" ? 6.1 : 5.0),
                    previous_sgpa: student.admission_no === "ADM202401" ? 8.4 : (student.admission_no === "ADM202402" ? 7.2 : 6.5),
                    active_kts: student.admission_no === "ADM202401" ? 0 : (student.admission_no === "ADM202402" ? 2 : 4),
                    resolved_kts: 1,
                    overall_status: student.admission_no === "ADM202401" ? "Pass" : "KT_Pending"
                });
                await academic.save();
            }

            // Seed sample attendance
            const today = new Date();
            for (let i = 0; i < 15; i++) {
                const date = new Date();
                date.setDate(today.getDate() - i);

                const status = (student.admission_no === "ADM202403" && i < 10) ? "Absent" : "Present";
                await Attendance.create({
                    student_id: student._id,
                    subject_name: "Machine Learning",
                    faculty_name: "Dr. K. Sharma",
                    date,
                    status
                }).catch(() => {});
            }

            // Create initial Risk Assessment
            const risk_score = student.admission_no === "ADM202401" ? 12 : (student.admission_no === "ADM202402" ? 58 : 84);
            const risk_level = student.admission_no === "ADM202401" ? "Low" : (student.admission_no === "ADM202402" ? "High" : "Critical");

            await RiskAssessment.findOneAndUpdate(
                { student_id: student._id },
                {
                    student_id: student._id,
                    risk_score,
                    risk_level,
                    shap_factors: [
                        {
                            feature: "active_kts",
                            label: "Unresolved KT Backlogs",
                            impact: student.admission_no === "ADM202401" ? -10 : 28,
                            direction: student.admission_no === "ADM202401" ? "risk_decrease" : "risk_increase",
                            explanation: `${academic.active_kts} active backlog(s) registered.`
                        },
                        {
                            feature: "sgpa_drop",
                            label: "SGPA Drop Between Semesters",
                            impact: student.admission_no === "ADM202401" ? -5 : 22,
                            direction: student.admission_no === "ADM202401" ? "risk_decrease" : "risk_increase",
                            explanation: "Significant drop in recent semester SGPA."
                        }
                    ],
                    feature_snapshot: {
                        sgpa_drop: student.admission_no === "ADM202401" ? 0.2 : 1.8,
                        current_cgpa: academic.cgpa,
                        active_kts: academic.active_kts,
                        attendance_percentage: student.admission_no === "ADM202403" ? 55.0 : 88.0,
                        rolling_30day_attendance_drop: student.admission_no === "ADM202403" ? 25.0 : 2.0,
                        fee_defaulter_flag: student.admission_no === "ADM202403" ? 1 : 0,
                        library_overdue_flag: 0
                    },
                    interventions: [
                        "Enroll in remedial classes for pending KT subjects",
                        "Schedule mandatory academic counseling session"
                    ],
                    last_assessed: new Date()
                },
                { upsert: true }
            );
        }

        console.log("Seeding completed successfully!");
        process.exit(0);

    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedRiskData();
