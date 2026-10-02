const XLSX = require("xlsx");
const path = require("path");

const data = [
  {
    "admission_no": "ADM2026001",
    "gr_no": "UID2026001",
    "pnr_no": "2026012345678901",
    "full_name": "Aarav Rajesh Sharma",
    "email": "aarav.sharma@smartcampus.edu",
    "phone": "9876543210",
    "department": "Computer Science",
    "academic_year": "2026-2027",
    "year_code": "FE",
    "division": "A"
  },
  {
    "admission_no": "ADM2026002",
    "gr_no": "UID2026002",
    "pnr_no": "2026012345678902",
    "full_name": "Ananya Vikram Joshi",
    "email": "ananya.joshi@smartcampus.edu",
    "phone": "9876543211",
    "department": "Computer Science",
    "academic_year": "2026-2027",
    "year_code": "FE",
    "division": "A"
  },
  {
    "admission_no": "ADM2026003",
    "gr_no": "UID2026003",
    "pnr_no": "2026012345678903",
    "full_name": "Rohan Suresh Verma",
    "email": "rohan.verma@smartcampus.edu",
    "phone": "9876543212",
    "department": "Computer Science",
    "academic_year": "2026-2027",
    "year_code": "FE",
    "division": "A"
  },
  {
    "admission_no": "ADM2026004",
    "gr_no": "UID2026004",
    "pnr_no": "2026012345678904",
    "full_name": "Priya Ramesh Mehta",
    "email": "priya.mehta@smartcampus.edu",
    "phone": "9876543213",
    "department": "Computer Science",
    "academic_year": "2026-2027",
    "year_code": "FE",
    "division": "A"
  },
  {
    "admission_no": "ADM2026005",
    "gr_no": "UID2026005",
    "pnr_no": "2026012345678905",
    "full_name": "Siddharth Nilesh Patil",
    "email": "siddharth.patil@smartcampus.edu",
    "phone": "9876543214",
    "department": "Computer Science",
    "academic_year": "2026-2027",
    "year_code": "FE",
    "division": "A"
  }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

const outputPath = path.join(__dirname, "sample_students_2026.xlsx");
XLSX.writeFile(workbook, outputPath);
console.log("Sample Excel file successfully generated at:", outputPath);
