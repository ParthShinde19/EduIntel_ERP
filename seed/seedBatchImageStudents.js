const mongoose = require("mongoose");
const Student = require("../models/Student");
const Batch = require("../models/Batch");
require("dotenv").config();

const rawUploadedList = [
  { admission_no: "ADM2023001", gr_no: "UID884102", pnr_no: "2023016400123451", full_name: "Aarav Sharma" },
  { admission_no: "ADM2023002", gr_no: "UID884103", pnr_no: "2023016400123452", full_name: "Ananya Kulkarni" },
  { admission_no: "ADM2023003", gr_no: "UID884104", pnr_no: "2023016400123453", full_name: "Rohan Mehta" },
  { admission_no: "ADM2023004", gr_no: "UID884105", pnr_no: "2023016400123454", full_name: "Sneha Patil" },
  { admission_no: "ADM2023005", gr_no: "UID884106", pnr_no: "2023016400123455", full_name: "Aditya Deshmukh" },
  { admission_no: "ADM2023006", gr_no: "UID884107", pnr_no: "2023016400123456", full_name: "Pooja Gupta" },
  { admission_no: "ADM2023007", gr_no: "UID884108", pnr_no: "2023016400123457", full_name: "Vikas Verma" },
  { admission_no: "ADM2023008", gr_no: "UID884109", pnr_no: "2023016400123458", full_name: "Neha Sawant" },
  { admission_no: "ADM2023009", gr_no: "UID884110", pnr_no: "2023016400123459", full_name: "Karan Joshi" },
  { admission_no: "ADM2023010", gr_no: "UID884111", pnr_no: "2023016400123460", full_name: "Riya Nair" },
  { admission_no: "ADM2023011", gr_no: "UID884112", pnr_no: "2023016400123461", full_name: "Siddharth Shinde" },
  { admission_no: "ADM2023012", gr_no: "UID884113", pnr_no: "2023016400123462", full_name: "Tanvi Bhat" },
  { admission_no: "ADM2023013", gr_no: "UID884114", pnr_no: "2023016400123463", full_name: "Ayush Mishra" },
  { admission_no: "ADM2023014", gr_no: "UID884115", pnr_no: "2023016400123464", full_name: "Isha Jadhav" },
  { admission_no: "ADM2023015", gr_no: "UID884116", pnr_no: "2023016400123465", full_name: "Prathamesh Gokhale" },
  { admission_no: "ADM2023016", gr_no: "UID884117", pnr_no: "2023016400123466", full_name: "Shruti More" },
  { admission_no: "ADM2023017", gr_no: "UID884118", pnr_no: "2023016400123467", full_name: "Harshwardhan Pawar" },
  { admission_no: "ADM2023018", gr_no: "UID884119", pnr_no: "2023016400123468", full_name: "Divya Pillai" },
  { admission_no: "ADM2023019", gr_no: "UID884120", pnr_no: "2023016400123469", full_name: "Gaurav Chavan" },
  { admission_no: "ADM2023020", gr_no: "UID884121", pnr_no: "2023016400123470", full_name: "Mrunal Salunkhe" },
  { admission_no: "ADM2023021", gr_no: "UID884122", pnr_no: "2023016400123471", full_name: "Omkar Rane" },
  { admission_no: "ADM2023022", gr_no: "UID884123", pnr_no: "2023016400123472", full_name: "Kavita Yadav" },
  { admission_no: "ADM2023023", gr_no: "UID884124", pnr_no: "2023016400123473", full_name: "Yash Tambe" },
  { admission_no: "ADM2023024", gr_no: "UID884125", pnr_no: "2023016400123474", full_name: "Sakshi Dubey" },
  { admission_no: "ADM2023025", gr_no: "UID884126", pnr_no: "2023016400123475", full_name: "Tejas Gaikwad" },
  { admission_no: "ADM2023026", gr_no: "UID884127", pnr_no: "2023016400123476", full_name: "Meera Kadam" },
  { admission_no: "ADM2023027", gr_no: "UID884128", pnr_no: "2023016400123477", full_name: "Manish Pandey" },
  { admission_no: "ADM2023028", gr_no: "UID884129", pnr_no: "2023016400123478", full_name: "Pallavi Bhosale" },
  { admission_no: "ADM2023029", gr_no: "UID884130", pnr_no: "2023016400123479", full_name: "Abhishek Tiwari" },
  { admission_no: "ADM2023030", gr_no: "UID884131", pnr_no: "2023016400123480", full_name: "Radhika Mahajan" },
  { admission_no: "ADM2023031", gr_no: "UID884132", pnr_no: "2023016400123481", full_name: "Chinmay Sawant" },
  { admission_no: "ADM2023032", gr_no: "UID884133", pnr_no: "2023016400123482", full_name: "Bhavna Jain" },
  { admission_no: "ADM2023033", gr_no: "UID884134", pnr_no: "2023016400123483", full_name: "Kunal Thakur" },
  { admission_no: "ADM2023034", gr_no: "UID884135", pnr_no: "2023016400123484", full_name: "Sayali Kamble" },
  { admission_no: "ADM2023035", gr_no: "UID884136", pnr_no: "2023016400123485", full_name: "Sanket Mhatre" }
];

const seedBatchUploadedStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_campus_management");
    console.log("Connected to MongoDB for processing uploaded batch file...");

    const departments = ["Computer Science", "Information Technology", "AI & Data Science", "Electronics & Telecom (EXTC)", "Mechanical Engineering"];
    const yearCodes = ["FE", "SE", "TE", "BE"];
    const divisions = ["A", "B"];
    const acadYears = ["2026-2027", "2025-2026", "2024-2025"];

    let count = 0;
    for (let i = 0; i < rawUploadedList.length; i++) {
      const item = rawUploadedList[i];
      const parts = item.full_name.trim().split(" ");
      const firstName = parts[0] || "Student";
      const surname = parts.length > 1 ? parts[parts.length - 1] : "User";
      const middleName = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";

      const dept = departments[i % departments.length];
      const yr = yearCodes[i % yearCodes.length];
      const div = divisions[i % divisions.length];
      const acadYr = acadYears[i % acadYears.length];

      await Student.findOneAndUpdate(
        { admission_no: item.admission_no },
        {
          admission_no: item.admission_no,
          gr_no: item.gr_no,
          pnr_no: item.pnr_no,
          first_name: firstName,
          middle_name: middleName,
          surname: surname,
          father_name: `${surname} Parent`,
          dob: new Date("2004-06-15"),
          email: `${firstName.toLowerCase()}.${surname.toLowerCase()}${i}@smartcampus.edu`,
          phone: `98765432${(i < 10 ? '0' : '') + i}`,
          course: "B.Tech Engineering",
          department: dept,
          year_code: yr,
          division: div,
          academic_year: acadYr,
          current_semester: yr === "FE" ? 1 : (yr === "SE" ? 3 : (yr === "TE" ? 5 : 7)),
          status: "active"
        },
        { upsert: true, new: true }
      );
      count++;
    }

    console.log(`Successfully imported & seeded all ${count} student records from uploaded file!`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err.message);
    process.exit(1);
  }
};

seedBatchUploadedStudents();
