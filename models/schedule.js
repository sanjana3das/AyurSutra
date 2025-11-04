// models/schedule.js
const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // change to "Patient" if your model is named that
    required: true,
  },
  name: { type: String, required: true }, // snapshot of patient's name
  email: { type: String, required: true }, // snapshot of patient's email
  therapy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Therapy",
    required: true,
  },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g. "10:00 - 11:00"
  therapist: { type: String }, // optional assigned therapist name/id
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
  qrData: { type: String }, // data URL for QR image
  createdAt: { type: Date, default: Date.now },
});

scheduleSchema.index(
  { therapy: 1, date: 1, timeSlot: 1 },
  { unique: true, sparse: true }
);
// index helps avoid duplicates (also handled in route check)

module.exports = mongoose.model("Schedule", scheduleSchema);
