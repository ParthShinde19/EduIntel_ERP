const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


// ADD EVENT
router.post(
  "/add",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        registration_link,
        event_date,
        due_date,
        contact_name,
        contact_details
      } = req.body;

      const eventDate = new Date(event_date);
      const dueDate = new Date(due_date);

      // Show 5 days before event
      const visibleFrom = new Date(eventDate);
      visibleFrom.setDate(visibleFrom.getDate() - 5);

      // Expire 48 hrs after due date
      const expireOn = new Date(dueDate);
      expireOn.setHours(expireOn.getHours() + 48);

      const event = new Event({
        title,
        description,
        registration_link,
        event_date,
        due_date,
        contact_name,
        contact_details,
        image: req.file ? req.file.path : null,
        visible_from: visibleFrom,
        expire_on: expireOn,
        status: "Hidden"
      });

      await event.save();

      res.status(201).json({
        success: true,
        message: "Event added successfully",
        event
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);


// GET LIVE EVENTS
router.get("/live", async (req, res) => {
  try {
    const today = new Date();

    // Publish events
    await Event.updateMany(
      {
        visible_from: { $lte: today },
        expire_on: { $gte: today },
        status: "Hidden"
      },
      {
        status: "Live"
      }
    );

    // Expire events
    await Event.updateMany(
      {
        expire_on: { $lt: today }
      },
      {
        status: "Expired"
      }
    );

    const liveEvents = await Event.find({
      status: "Live"
    }).sort({
      event_date: 1
    });

    res.status(200).json({
      success: true,
      events: liveEvents
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// GET ALL EVENTS
router.get("/all", protect, async (req, res) => {
  try {
    const events = await Event.find().sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      events
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// DELETE EVENT
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;