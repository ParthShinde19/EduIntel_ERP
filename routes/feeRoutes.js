const express = require("express");
const router = express.Router();
const Fee = require("../models/Fee");
const { protect, optionalProtect } = require("../middleware/authMiddleware");


// Add fee payment
router.post("/pay", protect, async (req, res) => {
    try {
        const fee = new Fee(req.body);
        await fee.save();

        res.status(201).json({
            message: "Fee payment recorded successfully",
            fee
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get all fee records
router.get("/all", optionalProtect, async (req, res) => {
    try {
        let fees = await Fee.find().populate("student_id");

        if (fees.length === 0) {
            const Student = require("../models/Student");
            const students = await Student.find();
            for (let idx = 0; idx < students.length; idx++) {
                const s = students[idx];
                const paid = idx % 2 === 0 ? 50000 : 25000;
                const status = paid === 50000 ? "Paid" : "Pending";
                await Fee.create({
                    student_id: s._id,
                    semester: s.current_semester || 1,
                    total_amount: 50000,
                    paid_amount: paid,
                    pending_amount: 50000 - paid,
                    payment_mode: "Online",
                    receipt_no: `REC-${Date.now()}-${idx}`,
                    status: status
                });
            }
            fees = await Fee.find().populate("student_id");
        }

        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});



// Get fee record by student
router.get("/student/:studentId", optionalProtect, async (req, res) => {
    try {
        const fees = await Fee.find({
            student_id: req.params.studentId
        });

        res.status(200).json(fees);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// Get pending dues
router.get("/pending/:studentId", optionalProtect, async (req, res) => {
    try {
        const pending = await Fee.find({
            student_id: req.params.studentId,
            pending_amount: { $gt: 0 }
        });

        res.status(200).json(pending);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Update fee status (Paid / Pending) - Admission Admin
router.put("/update-status/:id", optionalProtect, async (req, res) => {
    try {
        const { status, paid_amount, pending_amount } = req.body;
        const fee = await Fee.findByIdAndUpdate(
            req.params.id,
            { status, paid_amount, pending_amount },
            { new: true }
        );
        res.status(200).json({ message: "Fee status updated successfully", fee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create or update tuition fee dues for student
router.post("/set-fee-dues", optionalProtect, async (req, res) => {
    try {
        const { student_id, total_amount, paid_amount, status } = req.body;
        const total = total_amount || 50000;
        const paid = paid_amount !== undefined ? Number(paid_amount) : 50000;
        const pending = Math.max(0, total - paid);
        const feeStatus = status || (pending === 0 ? "Paid" : "Pending");

        const fee = await Fee.findOneAndUpdate(
            { student_id },
            {
                student_id,
                semester: req.body.semester || 1,
                total_amount: total,
                paid_amount: paid,
                pending_amount: pending,
                payment_mode: req.body.payment_mode || "Online",
                receipt_no: req.body.receipt_no || `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                status: feeStatus
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Fee dues updated successfully", fee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;