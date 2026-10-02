const Student = require("../models/Student");
const Batch = require("../models/Batch");

/**
 * Executes annual academic batch promotion for engineering students (July 10th schedule)
 * FE -> SE -> TE -> BE -> GRADUATED
 */
async function executeAnnualPromotion() {
    console.log("Executing annual batch promotion engine (FE -> SE -> TE -> BE)...");

    const activeStudents = await Student.find({ status: "active" });
    let promotedCount = 0;
    let graduatedCount = 0;

    for (const student of activeStudents) {
        let newYearCode = student.year_code;
        let newYear = student.current_year;
        let newSemester = student.current_semester;
        let newStatus = student.status;

        if (student.year_code === "FE") {
            newYearCode = "SE";
            newYear = 2;
            newSemester = 3;
            promotedCount++;
        } else if (student.year_code === "SE") {
            newYearCode = "TE";
            newYear = 3;
            newSemester = 5;
            promotedCount++;
        } else if (student.year_code === "TE") {
            newYearCode = "BE";
            newYear = 4;
            newSemester = 7;
            promotedCount++;
        } else if (student.year_code === "BE") {
            newYearCode = "GRADUATED";
            newStatus = "graduated";
            graduatedCount++;
        }

        // Update batch name e.g., 2024-FE-CS-A -> 2024-SE-CS-A
        let updatedBatchName = student.batch_name;
        if (student.batch_name && student.year_code !== newYearCode) {
            updatedBatchName = student.batch_name.replace(`-${student.year_code}-`, `-${newYearCode}-`);
        }

        await Student.findByIdAndUpdate(student._id, {
            year_code: newYearCode,
            current_year: newYear,
            current_semester: newSemester,
            status: newStatus,
            batch_name: updatedBatchName
        });
    }

    // Update active batches
    await Batch.updateMany(
        { is_active: true },
        { last_promoted: new Date() }
    );

    console.log(`Annual promotion complete: ${promotedCount} students promoted, ${graduatedCount} students graduated.`);

    return {
        promoted_students: promotedCount,
        graduated_students: graduatedCount,
        execution_date: new Date()
    };
}

module.exports = { executeAnnualPromotion };
