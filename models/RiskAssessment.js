const mongoose = require("mongoose");

const riskAssessmentSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        unique: true
    },
    risk_score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    risk_level: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        required: true
    },
    shap_factors: [
        {
            feature: { type: String, required: true },
            label: { type: String, required: true },
            impact: { type: Number, required: true }, // positive increases risk, negative decreases
            direction: { type: String, enum: ["risk_increase", "risk_decrease"], required: true },
            explanation: { type: String, required: true }
        }
    ],
    feature_snapshot: {
        sgpa_drop: { type: Number, default: 0 },
        current_cgpa: { type: Number, default: 0 },
        active_kts: { type: Number, default: 0 },
        attendance_percentage: { type: Number, default: 100 },
        rolling_30day_attendance_drop: { type: Number, default: 0 },
        fee_defaulter_flag: { type: Number, default: 0 },
        library_overdue_flag: { type: Number, default: 0 }
    },
    interventions: [
        { type: String }
    ],
    last_assessed: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("RiskAssessment", riskAssessmentSchema);
