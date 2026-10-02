const express = require("express");
const router = express.Router();
const Content = require("../models/Content");
const protect = require("../middleware/authMiddleware");


// =============================
// ABOUT SECTION
// =============================

// GET ABOUT
router.get("/about", async (req, res) => {
  try {
    const about = await Content.findOne({ section: "about" });

    res.status(200).json(about || { content: "" });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// SAVE ABOUT
router.post("/about", protect, async (req, res) => {
  try {
    const { content } = req.body;

    let about = await Content.findOne({ section: "about" });

    if (about) {
      about.content = content;
      await about.save();
    } else {
      about = await Content.create({
        section: "about",
        content
      });
    }

    res.status(200).json({
      message: "About content saved successfully",
      about
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// =============================
// CONTACT SECTION
// =============================

// GET CONTACT
router.get("/contact", async (req, res) => {
  try {
    const contact = await Content.findOne({ section: "contact" });

    res.status(200).json(contact || {});
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// SAVE CONTACT
router.post("/contact", protect, async (req, res) => {
  try {
    const {
      address,
      phone,
      email,
      office_hours,
      map_location
    } = req.body;

    let contact = await Content.findOne({ section: "contact" });

    if (contact) {
      contact.address = address;
      contact.phone = phone;
      contact.email = email;
      contact.office_hours = office_hours;
      contact.map_location = map_location;

      await contact.save();
    } else {
      contact = await Content.create({
        section: "contact",
        address,
        phone,
        email,
        office_hours,
        map_location
      });
    }

    res.status(200).json({
      message: "Contact content saved successfully",
      contact
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// =============================
// PRINCIPAL SECTION
// =============================

// GET PRINCIPAL
router.get("/principal", async (req, res) => {
  try {
    const principal = await Content.findOne({
      section: "principal"
    });

    res.status(200).json(principal || {});
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// SAVE PRINCIPAL
router.post("/principal", protect, async (req, res) => {
  try {
    const {
      name,
      message,
      image
    } = req.body;

    let principal = await Content.findOne({
      section: "principal"
    });

    if (principal) {
      principal.name = name;
      principal.message = message;
      principal.image = image;

      await principal.save();
    } else {
      principal = await Content.create({
        section: "principal",
        name,
        message,
        image
      });
    }

    res.status(200).json({
      message: "Principal content saved successfully",
      principal
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;