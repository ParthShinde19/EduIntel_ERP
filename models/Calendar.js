const mongoose = require("mongoose");

const academicEventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  event_date: { type: Date, required: true },
  category: { 
    type: String, 
    enum: ["Academic Term", "Holiday", "Weekoff", "Notification", "General"], 
    default: "General" 
  }
});

const calendarSchema = new mongoose.Schema(
  {
    file: { type: String, required: true },
    calendar_type: { 
      type: String, 
      enum: ["academic", "regular"], 
      required: true 
    },
    important_dates: [academicEventSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Calendar", calendarSchema);