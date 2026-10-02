const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const academicRoutes = require("./routes/academicRoutes");
const idCardRoutes = require("./routes/idCardRoutes");
const committeeRoutes = require("./routes/committeeRoutes");
const appreciationRoutes = require("./routes/appreciationRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const eventRoutes = require("./routes/eventRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const academicCalendarRoutes = require("./routes/academicCalendarRoutes");
const nssRoutes = require("./routes/nssRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const feeRoutes = require("./routes/feeRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const placementRoutes = require("./routes/placementRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const alumniRoutes = require("./routes/alumniRoutes");
const bookRoutes = require("./routes/bookRoutes");
const issueRoutes = require("./routes/issueRoutes");
const contentRoutes = require("./routes/contentRoutes");
const academicRiskRoutes = require("./routes/academicRiskRoutes");
const qrRoutes = require("./routes/qrRoutes");
const batchRoutes = require("./routes/batchRoutes");
const examRoutes = require("./routes/examRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const teacherRoutes = require("./routes/teacherRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/academics", academicRoutes);
app.use("/api/idcards", idCardRoutes);
app.use("/api/committees", committeeRoutes);
app.use("/api/appreciation", appreciationRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/calendar", academicCalendarRoutes);
app.use("/api/nss", nssRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/risk", academicRiskRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/student-profile", studentProfileRoutes);
app.use("/api/teacher", teacherRoutes);

app.get("/", (req, res) => {
    res.send("Smart Campus Management System Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});