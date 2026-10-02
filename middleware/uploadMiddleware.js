const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads/";

    // Determine the exact destination folder by analyzing the route path safely
    const url = req.originalUrl.toLowerCase();

    if (url.includes("/calendar")) {
      uploadPath = "uploads/calendar/";
    } else if (url.includes("/events")) {
      uploadPath = "uploads/events/";
    } else if (url.includes("/principal")) {
      uploadPath = "uploads/principal/";
    } else if (url.includes("/notices")) {
      uploadPath = "uploads/notices/";
    } else if (file.mimetype.startsWith("image/")) {
      uploadPath = "uploads/gallery/";
    }

    // 🛠️ FIX: Convert to an absolute system path to eliminate permissions & tracking bugs
    const absolutePath = path.resolve(process.cwd(), uploadPath);

    // Safely verify and create directories recursively with absolute paths
    try {
      if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath, { recursive: true });
      }
      // Pass the absolute path down to multer's engine
      cb(null, absolutePath);
    } catch (err) {
      console.error("Multer directory creation failed:", err);
      cb(err, null);
    }
  },

  filename: function (req, file, cb) {
    // Retain clean, collision-resistant unique file naming conventions
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure file filtering options if required
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Max File Size limit safeguard
});

module.exports = upload;