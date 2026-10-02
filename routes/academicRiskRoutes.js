const express = require("express");
const router = express.Router();
const { optionalProtect } = require("../middleware/authMiddleware");
const Student = require("../models/Student");
const AcademicRecord = require("../models/AcademicRecord");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const Borrow = require("../models/Borrow");
const RiskAssessment = require("../models/RiskAssessment");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

// Fallback rule-based SHAP engine if Python microservice is offline
function computeFallbackRisk(features) {
    const {
        sgpa_drop,
        current_cgpa,
        active_kts,
        attendance_percentage,
        rolling_30day_attendance_drop,
        fee_defaulter_flag,
        library_overdue_flag
    } = features;

    let score = 10;
    const factors = [];
    const interventions = [];

    if (active_kts > 0) {
        const impact = active_kts * 15;
        score += impact;
        factors.push({
            feature: "active_kts",
            label: "Unresolved KT Backlogs",
            impact,
            direction: "risk_increase",
            explanation: `${active_kts} active backlog(s) registered.`
        });
        interventions.push(`Enroll in remedial classes for ${active_kts} pending KT subjects.`);
    }

    if (sgpa_drop > 0.3) {
        const impact = Math.round(sgpa_drop * 16);
        score += impact;
        factors.push({
            feature: "sgpa_drop",
            label: "SGPA Drop Between Semesters",
            impact,
            direction: "risk_increase",
            explanation: `SGPA dropped by ${sgpa_drop.toFixed(2)} points in recent semester.`
        });
        interventions.push("Schedule academic counseling session for SGPA drop.");
    }

    if (attendance_percentage < 75) {
        const impact = Math.round((75 - attendance_percentage) * 1.2);
        score += impact;
        factors.push({
            feature: "attendance_percentage",
            label: "Overall Attendance %",
            impact,
            direction: "risk_increase",
            explanation: `Attendance is ${attendance_percentage.toFixed(1)}%, below 75% threshold.`
        });
        interventions.push("Issue official attendance warning.");
    }

    if (rolling_30day_attendance_drop > 10) {
        const impact = Math.round(rolling_30day_attendance_drop * 0.9);
        score += impact;
        factors.push({
            feature: "rolling_30day_attendance_drop",
            label: "30-Day Rolling Attendance Drop",
            impact,
            direction: "risk_increase",
            explanation: `Attendance dropped ${rolling_30day_attendance_drop.toFixed(1)}% in the last 30 days.`
        });
    }

    if (current_cgpa < 6.0) {
        const impact = Math.round((6.0 - current_cgpa) * 10);
        score += impact;
        factors.push({
            feature: "current_cgpa",
            label: "Current CGPA",
            impact,
            direction: "risk_increase",
            explanation: `CGPA is ${current_cgpa.toFixed(2)}, below safe margin.`
        });
    } else {
        factors.push({
            feature: "current_cgpa",
            label: "Current CGPA",
            impact: -8,
            direction: "risk_decrease",
            explanation: `Strong CGPA of ${current_cgpa.toFixed(2)}.`
        });
    }

    if (fee_defaulter_flag === 1) {
        score += 10;
        factors.push({
            feature: "fee_defaulter_flag",
            label: "Pending Tuition Fee Status",
            impact: 10,
            direction: "risk_increase",
            explanation: "Tuition fee payment outstanding."
        });
        interventions.push("Contact Accounts office to clear tuition fee dues.");
    }

    if (library_overdue_flag === 1) {
        score += 5;
        factors.push({
            feature: "library_overdue_flag",
            label: "Overdue Library Books",
            impact: 5,
            direction: "risk_increase",
            explanation: "Library books overdue."
        });
    }

    score = Math.min(Math.max(score, 0), 100);

    let level = "Low";
    if (score > 75) level = "Critical";
    else if (score > 55) level = "High";
    else if (score > 30) level = "Medium";

    if (interventions.length === 0) {
        interventions.push("Maintain academic performance and aim for semester distinction.");
    }

    return {
        risk_score: score,
        risk_level: level,
        shap_factors: factors,
        interventions,
        feature_snapshot: features
    };
}

// Predict and evaluate risk for a specific student
router.get("/student/:studentId", optionalProtect, async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // 1. Gather longitudinal academic data
        const academicRecords = await AcademicRecord.find({ student_id: student._id }).sort({ semester: 1 });
        
        let sgpa_drop = 0;
        let current_cgpa = 7.5;
        let active_kts = 0;

        if (academicRecords.length > 0) {
            const latest = academicRecords[academicRecords.length - 1];
            current_cgpa = latest.cgpa || 7.5;
            active_kts = latest.active_kts || 0;

            if (academicRecords.length >= 2) {
                const prev = academicRecords[academicRecords.length - 2];
                sgpa_drop = Math.max(0, (prev.sgpa || 0) - (latest.sgpa || 0));
            }
        }

        // 2. Gather attendance data
        const totalAttendance = await Attendance.countDocuments({ student_id: student._id });
        const presentCount = await Attendance.countDocuments({ student_id: student._id, status: "Present" });
        const attendance_percentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 85.0;

        // Calculate 30-day rolling attendance drop
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentTotal = await Attendance.countDocuments({ student_id: student._id, date: { $gte: thirtyDaysAgo } });
        const recentPresent = await Attendance.countDocuments({ student_id: student._id, status: "Present", date: { $gte: thirtyDaysAgo } });
        const recent_attendance_pct = recentTotal > 0 ? (recentPresent / recentTotal) * 100 : attendance_percentage;
        const rolling_30day_attendance_drop = Math.max(0, attendance_percentage - recent_attendance_pct);

        // 3. Gather administrative flags (Fees & Library)
        const pendingFee = await Fee.findOne({ student_id: student._id, status: "Pending" });
        const fee_defaulter_flag = pendingFee ? 1 : 0;

        const overdueBook = await Borrow.findOne({ student_id: student._id, status: "Issued", due_date: { $lt: new Date() } });
        const library_overdue_flag = overdueBook ? 1 : 0;

        const featurePayload = {
            sgpa_drop: Number(sgpa_drop.toFixed(2)),
            current_cgpa: Number(current_cgpa.toFixed(2)),
            active_kts: Number(active_kts),
            attendance_percentage: Number(attendance_percentage.toFixed(1)),
            rolling_30day_attendance_drop: Number(rolling_30day_attendance_drop.toFixed(1)),
            fee_defaulter_flag,
            library_overdue_flag
        };

        // 4. Call Python ML microservice
        let riskResult;
        try {
            const mlResponse = await fetch(`${ML_SERVICE_URL}/predict-risk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(featurePayload)
            });

            if (mlResponse.ok) {
                riskResult = await mlResponse.json();
            } else {
                console.warn("ML Service returned non-200. Using fallback rule engine.");
                riskResult = computeFallbackRisk(featurePayload);
            }
        } catch (mlErr) {
            console.warn("ML Service unreachable. Using local fallback rule engine:", mlErr.message);
            riskResult = computeFallbackRisk(featurePayload);
        }

        // 5. Store/Update RiskAssessment in MongoDB
        const assessment = await RiskAssessment.findOneAndUpdate(
            { student_id: student._id },
            {
                student_id: student._id,
                risk_score: riskResult.risk_score,
                risk_level: riskResult.risk_level,
                shap_factors: riskResult.shap_factors,
                feature_snapshot: featurePayload,
                interventions: riskResult.interventions,
                last_assessed: new Date()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            student: {
                id: student._id,
                name: `${student.first_name} ${student.surname}`,
                admission_no: student.admission_no,
                course: student.course,
                department: student.department,
                current_year: student.current_year
            },
            assessment
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Institute-wide Risk Analytics Dashboard
router.get("/analytics/dashboard", optionalProtect, async (req, res) => {
    try {
        const assessments = await RiskAssessment.find().populate("student_id", "first_name surname admission_no course department");

        const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
        let totalScore = 0;
        const topDrivers = {};

        assessments.forEach(item => {
            counts[item.risk_level] = (counts[item.risk_level] || 0) + 1;
            totalScore += item.risk_score;

            item.shap_factors.forEach(factor => {
                if (factor.direction === "risk_increase") {
                    topDrivers[factor.label] = (topDrivers[factor.label] || 0) + 1;
                }
            });
        });

        const totalStudents = assessments.length;
        const averageRiskScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;

        res.status(200).json({
            total_students_assessed: totalStudents,
            average_risk_score: averageRiskScore,
            risk_distribution: counts,
            top_risk_drivers: Object.entries(topDrivers)
                .map(([label, count]) => ({ label, count }))
                .sort((a, b) => b.count - a.count),
            high_risk_students: assessments
                .filter(a => a.risk_level === "High" || a.risk_level === "Critical")
                .sort((a, b) => b.risk_score - a.risk_score)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
