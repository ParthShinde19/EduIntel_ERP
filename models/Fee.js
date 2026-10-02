const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    semester: {
        type: Number,
        default: 1
    },
    total_amount: {
        type: Number,
        default: 50000
    },
    paid_amount: {
        type: Number,
        default: 0
    },
    pending_amount: {
        type: Number,
        default: 50000
    },
    payment_date: {
        type: Date,
        default: Date.now
    },
    payment_mode: {
        type: String,
        enum: ["Cash", "Online", "Cheque", "UPI"],
        default: "Online"
    },
    receipt_no: {
        type: String,
        default: () => `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    },
    status: {
        type: String,
        enum: ["Paid", "Partial", "Pending"],
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);