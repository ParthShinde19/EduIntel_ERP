const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    venue: {
        type: String
    },

    event_date: {
        type: Date,
        required: true
    },

    event_time: {
        type: String
    },

    organizer: {
        type: String
    },

    registration_link: {
        type: String
    },

    due_date: {
        type: Date
    },

    contact_name: {
        type: String
    },

    contact_details: {
        type: String
    },

    image: {
        type: String
    }, // <-- missing comma fixed here

    // Auto visibility logic
    visible_from: {
        type: Date
    },

    // Auto expiry logic
    expire_on: {
        type: Date
    },

    status: {
        type: String,
        enum: ["Hidden", "Live", "Expired"],
        default: "Hidden"
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Event", eventSchema);