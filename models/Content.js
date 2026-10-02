const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
{
  section: {
    type: String,
    required: true,
    unique: true
  },

  // About section
  content: {
    type: String,
    default: ""
  },

  // Shared image field
  image: {
    type: String,
    default: ""
  },

  // Contact section
  address: {
    type: String,
    default: ""
  },

  phone: {
    type: String,
    default: ""
  },

  email: {
    type: String,
    default: ""
  },

  office_hours: {
    type: String,
    default: ""
  },

  map_location: {
    type: String,
    default: ""
  },

  // Principal section
  name: {
    type: String,
    default: ""
  },

  message: {
    type: String,
    default: ""
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Content", contentSchema);