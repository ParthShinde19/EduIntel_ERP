const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    image_url: {
        type: String,
        required: true
    },
    uploaded_by: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Gallery", gallerySchema);