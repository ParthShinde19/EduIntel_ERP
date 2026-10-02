const mongoose = require("mongoose");
const Student = require("../models/Student");
const Batch = require("../models/Batch");
const AcademicRecord = require("../models/AcademicRecord");
const Assessment = require("../models/Assessment");
const Fee = require("../models/Fee");
require("dotenv").config();

const cleanTo4Students = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_campus_management";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for database cleanup...");

    // Clear existing collections
    await Student.deleteMany({});
    await Batch.deleteMany({});
    await AcademicRecord.deleteMany({});
    await Assessment.deleteMany({});
    await Fee.deleteMany({});
    console.log("Cleared existing Students, Batches, Academic Records, Assessments, and Fees.");

    // Create 3 active batches for the 4 students
    const batches = await Batch.insertMany([
      {
        academic_year: "2024-2025",
        department: "Computer Science",
        year_code: "FE",
        batch_name: "2024-2025-FE-CS-A",
        section: "A",
        student_count: 2
      },
      {
        academic_year: "2024-2025",
        department: "Information Technology",
        year_code: "SE",
        batch_name: "2024-2025-SE-IT-A",
        section: "A",
        student_count: 1
      },
      {
        academic_year: "2024-2025",
        department: "Electronics & Telecom",
        year_code: "TE",
        batch_name: "2024-2025-TE-EXTC-B",
        section: "B",
        student_count: 1
      }
    ]);

    const batchMap = {};
    batches.forEach(b => { batchMap[b.batch_name] = b; });

    // Seed exactly 4 clean students
    const fourStudents = [
      {
        admission_no: "ADM2024001",
        pnr_no: "PNR2024001",
        gr_no: "UID2024001",
        first_name: "Parth",
        middle_name: "Deepak",
        surname: "Shinde",
        father_name: "Deepak Shinde",
        dob: new Date("2004-03-15"),
        gender: "Male",
        email: "parth.shinde@smartcampus.edu",
        phone: "9876543210",
        blood_group: "O+",
        emergency_contact: "9876543211",
        residential_address: "Campus Hostel Block A",
        parent_phone: "9876543212",
        parent_address: "Mumbai, Maharashtra",
        course: "B.Tech Engineering",
        department: "Computer Science",
        academic_year: "2024-2025",
        year_code: "FE",
        division: "A",
        current_year: 1,
        current_semester: 1,
        batch_id: batchMap["2024-2025-FE-CS-A"]._id,
        batch_name: "2024-2025-FE-CS-A",
        status: "active"
      },
      {
        admission_no: "ADM2024002",
        pnr_no: "PNR2024002",
        gr_no: "UID2024002",
        first_name: "Rahul",
        middle_name: "Rajesh",
        surname: "Sharma",
        father_name: "Rajesh Sharma",
        dob: new Date("2004-06-20"),
        gender: "Male",
        email: "rahul.sharma@smartcampus.edu",
        phone: "9876543220",
        blood_group: "A+",
        emergency_contact: "9876543221",
        residential_address: "Campus Hostel Block A",
        parent_phone: "9876543222",
        parent_address: "Pune, Maharashtra",
        course: "B.Tech Engineering",
        department: "Computer Science",
        academic_year: "2024-2025",
        year_code: "FE",
        division: "A",
        current_year: 1,
        current_semester: 1,
        batch_id: batchMap["2024-2025-FE-CS-A"]._id,
        batch_name: "2024-2025-FE-CS-A",
        status: "active"
      },
      {
        admission_no: "ADM2024003",
        pnr_no: "PNR2024003",
        gr_no: "UID2024003",
        first_name: "Priya",
        middle_name: "Vikram",
        surname: "Patel",
        father_name: "Vikram Patel",
        dob: new Date("2003-11-10"),
        gender: "Female",
        email: "priya.patel@smartcampus.edu",
        phone: "9876543230",
        blood_group: "B+",
        emergency_contact: "9876543231",
        residential_address: "Campus Girls Hostel",
        parent_phone: "9876543232",
        parent_address: "Ahmedabad, Gujarat",
        course: "B.Tech Engineering",
        department: "Information Technology",
        academic_year: "2024-2025",
        year_code: "SE",
        division: "A",
        current_year: 2,
        current_semester: 3,
        batch_id: batchMap["2024-2025-SE-IT-A"]._id,
        batch_name: "2024-2025-SE-IT-A",
        status: "active"
      },
      {
        admission_no: "ADM2024004",
        pnr_no: "PNR2024004",
        gr_no: "UID2024004",
        first_name: "Amit",
        middle_name: "Suresh",
        surname: "Verma",
        father_name: "Suresh Verma",
        dob: new Date("2002-08-05"),
        gender: "Male",
        email: "amit.verma@smartcampus.edu",
        phone: "9876543240",
        blood_group: "AB+",
        emergency_contact: "9876543241",
        residential_address: "Campus Hostel Block B",
        parent_phone: "9876543242",
        parent_address: "Nagpur, Maharashtra",
        course: "B.Tech Engineering",
        department: "Electronics & Telecom",
        academic_year: "2024-2025",
        year_code: "TE",
        division: "B",
        current_year: 3,
        current_semester: 5,
        batch_id: batchMap["2024-2025-TE-EXTC-B"]._id,
        batch_name: "2024-2025-TE-EXTC-B",
        status: "active"
      }
    ];

    const insertedStudents = await Student.insertMany(fourStudents);
    console.log(`Successfully created ${insertedStudents.length} clean student records!`);

    // Create Academic Records for these 4 students
    const academicRecords = [
      {
        student_id: insertedStudents[0]._id,
        academic_year: "2024-2025",
        year_code: "FE",
        semester: 1,
        department: "Computer Science",
        subjects: [
          { subject_name: "Engineering Mathematics I", marks: 88, status: "Pass" },
          { subject_name: "Computer Programming in C", marks: 92, status: "Pass" },
          { subject_name: "Basic Electrical Engineering", marks: 85, status: "Pass" }
        ],
        sgpa: 9.1,
        cgpa: 9.1,
        active_kts: 0,
        overall_status: "Pass"
      },
      {
        student_id: insertedStudents[1]._id,
        academic_year: "2024-2025",
        year_code: "FE",
        semester: 1,
        department: "Computer Science",
        subjects: [
          { subject_name: "Engineering Mathematics I", marks: 54, status: "Pass" },
          { subject_name: "Computer Programming in C", marks: 38, status: "KT" },
          { subject_name: "Basic Electrical Engineering", marks: 61, status: "Pass" }
        ],
        sgpa: 6.2,
        cgpa: 6.2,
        active_kts: 1,
        overall_status: "KT_Pending"
      },
      {
        student_id: insertedStudents[2]._id,
        academic_year: "2024-2025",
        year_code: "SE",
        semester: 3,
        department: "Information Technology",
        subjects: [
          { subject_name: "Data Structures & Algorithms", marks: 78, status: "Pass" },
          { subject_name: "Database Management Systems", marks: 81, status: "Pass" },
          { subject_name: "Discrete Mathematics", marks: 74, status: "Pass" }
        ],
        sgpa: 8.0,
        cgpa: 8.0,
        active_kts: 0,
        overall_status: "Pass"
      },
      {
        student_id: insertedStudents[3]._id,
        academic_year: "2024-2025",
        year_code: "TE",
        semester: 5,
        department: "Electronics & Telecom",
        subjects: [
          { subject_name: "Microcontrollers & Embedded Systems", marks: 95, status: "Pass" },
          { subject_name: "Signals & Systems", marks: 89, status: "Pass" },
          { subject_name: "Electromagnetic Wave Theory", marks: 91, status: "Pass" }
        ],
        sgpa: 9.3,
        cgpa: 9.3,
        active_kts: 0,
        overall_status: "Pass"
      }
    ];
    await AcademicRecord.insertMany(academicRecords);

    // Create Assessments for these 4 students
    const assessments = [
      {
        student_id: insertedStudents[0]._id,
        academic_year: "2024-2025",
        year_code: "FE",
        semester: 1,
        department: "Computer Science",
        division: "A",
        subject_name: "Computer Programming in C",
        ia1_marks: 19,
        ia2_marks: 20,
        lecture_attendance_present: 38,
        lecture_attendance_total: 40,
        practical_attendance_present: 19,
        practical_attendance_total: 20
      },
      {
        student_id: insertedStudents[1]._id,
        academic_year: "2024-2025",
        year_code: "FE",
        semester: 1,
        department: "Computer Science",
        division: "A",
        subject_name: "Computer Programming in C",
        ia1_marks: 12,
        ia2_marks: 11,
        lecture_attendance_present: 26,
        lecture_attendance_total: 40,
        practical_attendance_present: 13,
        practical_attendance_total: 20
      },
      {
        student_id: insertedStudents[2]._id,
        academic_year: "2024-2025",
        year_code: "SE",
        semester: 3,
        department: "Information Technology",
        division: "A",
        subject_name: "Data Structures & Algorithms",
        ia1_marks: 17,
        ia2_marks: 16,
        lecture_attendance_present: 34,
        lecture_attendance_total: 40,
        practical_attendance_present: 17,
        practical_attendance_total: 20
      },
      {
        student_id: insertedStudents[3]._id,
        academic_year: "2024-2025",
        year_code: "TE",
        semester: 5,
        department: "Electronics & Telecom",
        division: "B",
        subject_name: "Microcontrollers & Embedded Systems",
        ia1_marks: 20,
        ia2_marks: 19,
        lecture_attendance_present: 39,
        lecture_attendance_total: 40,
        practical_attendance_present: 20,
        practical_attendance_total: 20
      }
    ];
    await Assessment.insertMany(assessments);

    // Create Fee Records for these 4 students
    const fees = [
      { student_id: insertedStudents[0]._id, total_amount: 50000, paid_amount: 50000, status: "Paid" },
      { student_id: insertedStudents[1]._id, total_amount: 50000, paid_amount: 25000, status: "Pending" },
      { student_id: insertedStudents[2]._id, total_amount: 50000, paid_amount: 50000, status: "Paid" },
      { student_id: insertedStudents[3]._id, total_amount: 50000, paid_amount: 50000, status: "Paid" }
    ];
    await Fee.insertMany(fees);

    console.log("Database reset complete! Database now contains EXACTLY 4 clean student records.");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err);
    process.exit(1);
  }
};

cleanTo4Students();
