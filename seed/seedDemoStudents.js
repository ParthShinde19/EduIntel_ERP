const mongoose = require("mongoose");
const Student = require("../models/Student");
require("dotenv").config();

const sampleStudentsData = [
  { admission_no: "ADM202401", pnr_no: "PNR9901", first_name: "Rahul", surname: "Sharma", department: "Computer Science", year_code: "FE", division: "A", academic_year: "2026-2027", current_semester: 1 },
  { admission_no: "ADM202402", pnr_no: "PNR9902", first_name: "Priya", surname: "Patel", department: "Information Technology", year_code: "FE", division: "A", academic_year: "2026-2027", current_semester: 1 },
  { admission_no: "ADM202403", pnr_no: "PNR9903", first_name: "Amit", surname: "Verma", department: "Electronics & Telecom (EXTC)", year_code: "SE", division: "B", academic_year: "2026-2027", current_semester: 3 },
  { admission_no: "ADM202404", pnr_no: "PNR9904", first_name: "Parth", surname: "Shinde", department: "Computer Science", year_code: "SE", division: "A", academic_year: "2026-2027", current_semester: 3 },
  { admission_no: "ADM202405", pnr_no: "PNR9905", first_name: "Neha", surname: "Kulkarni", department: "Computer Science", year_code: "FE", division: "B", academic_year: "2026-2027", current_semester: 1 },
  { admission_no: "ADM202406", pnr_no: "PNR9906", first_name: "Aditya", surname: "Deshmukh", department: "AI & Data Science", year_code: "TE", division: "A", academic_year: "2026-2027", current_semester: 5 },
  { admission_no: "ADM202407", pnr_no: "PNR9907", first_name: "Sneha", surname: "Joshi", department: "Information Technology", year_code: "TE", division: "B", academic_year: "2026-2027", current_semester: 5 },
  { admission_no: "ADM202408", pnr_no: "PNR9908", first_name: "Rohan", surname: "Mehta", department: "Mechanical Engineering", year_code: "BE", division: "A", academic_year: "2026-2027", current_semester: 7 },
  { admission_no: "ADM202409", pnr_no: "PNR9909", first_name: "Ananya", surname: "Roy", department: "Computer Science", year_code: "BE", division: "A", academic_year: "2026-2027", current_semester: 7 },
  { admission_no: "ADM202410", pnr_no: "PNR9910", first_name: "Vikram", surname: "Singh", department: "Electronics & Telecom (EXTC)", year_code: "FE", division: "A", academic_year: "2026-2027", current_semester: 1 },
  { admission_no: "ADM202411", pnr_no: "PNR9911", first_name: "Tanvi", surname: "Shah", department: "AI & Data Science", year_code: "SE", division: "A", academic_year: "2026-2027", current_semester: 3 },
  { admission_no: "ADM202412", pnr_no: "PNR9912", first_name: "Yash", surname: "Patil", department: "Mechanical Engineering", year_code: "SE", division: "B", academic_year: "2026-2027", current_semester: 3 },
  { admission_no: "ADM202413", pnr_no: "PNR9913", first_name: "Ishan", surname: "Sawant", department: "Computer Science", year_code: "TE", division: "A", academic_year: "2026-2027", current_semester: 5 },
  { admission_no: "ADM202414", pnr_no: "PNR9914", first_name: "Riya", surname: "Kadam", department: "Information Technology", year_code: "FE", division: "B", academic_year: "2026-2027", current_semester: 1 },
  { admission_no: "ADM202415", pnr_no: "PNR9915", first_name: "Aarav", surname: "Mane", department: "Computer Science", year_code: "FE", division: "A", academic_year: "2026-2027", current_semester: 1 }
];

const seedDemoStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_campus_management");
    console.log("Connected to MongoDB for student seeding...");

    for (const item of sampleStudentsData) {
      await Student.findOneAndUpdate(
        { admission_no: item.admission_no },
        {
          ...item,
          father_name: "Father Name",
          dob: new Date("2004-05-15"),
          email: `${item.first_name.toLowerCase()}.${item.surname.toLowerCase()}@smartcampus.edu`,
          phone: "9876543210",
          course: "B.Tech Engineering",
          status: "active"
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded student: [${item.admission_no}] - ${item.first_name} ${item.surname}`);
    }

    console.log("Student seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err.message);
    process.exit(1);
  }
};

seedDemoStudents();
