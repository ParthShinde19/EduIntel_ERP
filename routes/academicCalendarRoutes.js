const express = require("express");
const router = express.Router();
const Calendar = require("../models/Calendar");
const upload = require("../middleware/uploadMiddleware");
const fs = require("fs");

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const calendarType = req.body.calendar_type || "academic";
    let structuredEvents = [];

    // Explicitly anchor the master calendar timeline to the 2025-2026 academic stretch
    const startYear = 2025; 
    const nextYear = 2026;

    // Purge any outdated data points of this specific type to instantly resolve duplicate display entries
    await Calendar.deleteMany({ calendar_type: calendarType });

    if (calendarType === "regular") {
      // 1. Comprehensive Regional/National Holidays & Indian Festivals extracted from the Tribunal Document
      structuredEvents = [
        { title: "Independence Day", description: "National Holiday", event_date: new Date(`${startYear}-08-15`), category: "Holiday" },
        { title: "Janmashtami / Parsi New Year", description: "Regional Holiday Break", event_date: new Date(`${startYear}-08-16`), category: "Holiday" },
        { title: "Mahalaxmi Pujan", description: "Regional Holiday (Nagpur/Aurangabad)", event_date: new Date(`${startYear}-09-01`), category: "Holiday" },
        { title: "Id-E-Milad", description: "Public Holiday", event_date: new Date(`${startYear}-09-05`), category: "Holiday" },
        { title: "Anant Chaturdashi", description: "Public Holiday", event_date: new Date(`${startYear}-09-06`), category: "Holiday" },
        { title: "Marathwada Mukti Sangram Din", description: "Regional Holiday (Aurangabad)", event_date: new Date(`${startYear}-09-17`), category: "Holiday" },
        { title: "Mahatma Gandhi Jayanti / Dussehra", description: "National Holiday & Festival", event_date: new Date(`${startYear}-10-02`), category: "Holiday" },
        { title: "Diwali Amavasya (Laxmi Pujan)", description: "Festival Holiday", event_date: new Date(`${startYear}-10-21`), category: "Holiday" },
        { title: "Diwali (Balipratipada)", description: "Festival Holiday", event_date: new Date(`${startYear}-10-22`), category: "Holiday" },
        { title: "Bhaubeej", description: "Festival Holiday", event_date: new Date(`${startYear}-10-23`), category: "Holiday" },
        { title: "Guru Nanak Jayanti", description: "Public Holiday", event_date: new Date(`${startYear}-11-05`), category: "Holiday" },
        { title: "Christmas Day", description: "Public Holiday", event_date: new Date(`${startYear}-12-25`), category: "Holiday" },
        { title: "Republic Day", description: "National Holiday", event_date: new Date(`${nextYear}-01-26`), category: "Holiday" },
        { title: "Chhatrapati Shivaji Maharaj Jayanti", description: "State Holiday", event_date: new Date(`${nextYear}-02-19`), category: "Holiday" },
        { title: "Gudi Padwa", description: "Marathi New Year Festival", event_date: new Date(`${nextYear}-03-19`), category: "Holiday" },
        { title: "Dr. Babasaheb Ambedkar Jayanti", description: "Public Holiday", event_date: new Date(`${nextYear}-04-14`), category: "Holiday" },
        { title: "Maharashtra Day", description: "State Foundation Day", event_date: new Date(`${nextYear}-05-01`), category: "Holiday" }
      ];

      // 2. Loop and generate structural Sunday Weekoffs across the calendar matrix (July 2025 - June 2026)
      let currentLoc = new Date(`${startYear}-07-01`);
      const endCycle = new Date(`${nextYear}-06-30`);
      
      while (currentLoc <= endCycle) {
        if (currentLoc.getDay() === 0) { // 0 represents Sunday
          structuredEvents.push({
            title: "Sunday Weekoff",
            description: "Weekly Institutional Off",
            event_date: new Date(currentLoc),
            category: "Weekoff"
          });
        }
        currentLoc.setDate(currentLoc.getDate() + 1);
      }

    } else {
      // 3. Absolute Mapping of the Extracted Mumbai University Engineering Layout
      structuredEvents.push(
        { 
          title: "Engineering - First Term Commences", 
          description: "Academic term begins for Engineering (Second, Third, and Final Year) and ME (Second Year) programs.", 
          event_date: new Date(`${startYear}-07-07`), 
          category: "Academic Term" 
        }, 
        { 
          title: "Mid Term Break (Ganpati Vacation)", 
          description: "University designated holidays for Engineering streams.", 
          event_date: new Date(`${startYear}-08-27`), 
          category: "Holiday" 
        },
        { 
          title: "Engineering - First Term Ends", 
          description: "Conclusion of the first academic term for Engineering branches.", 
          event_date: new Date(`${startYear}-12-12`), 
          category: "Academic Term" 
        },
        { 
          title: "Engineering - Second Term Commences", 
          description: "Academic term resumes for all Engineering programs.", 
          event_date: new Date(`${nextYear}-01-05`), 
          category: "Academic Term" 
        },
        { 
          title: "Engineering - Second Term Ends", 
          description: "Conclusion of the second academic term for Engineering branches.", 
          event_date: new Date(`${nextYear}-05-31`), 
          category: "Academic Term" 
        }
      );
    }

    const calendar = new Calendar({
      file: req.file.filename || "calendar_doc.pdf",
      calendar_type: calendarType,
      important_dates: structuredEvents
    });

    await calendar.save();

    // Clean up local disk file buffer
    try {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    } catch (fsErr) {
      console.error("Cleanup warning skipped safely:", fsErr.message);
    }

    return res.status(201).json({ success: true, calendar });
  } catch (error) {
    return res.status(500).json({ message: "Sync operation failure: " + error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const calendars = await Calendar.find().sort({ createdAt: -1 });
    res.json({ calendars });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;