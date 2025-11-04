// routes/schedule.js
const express = require("express");
const router = express.Router();
const Schedule = require("../models/schedule");
const Therapy = require("../models/therapy");
const QRCode = require("qrcode");
const { isLoggedIn } = require("../middleware.js"); // your existing middleware

// Fixed time slots (10:00 - 20:00) — modify if you want other slots
const TIME_SLOTS = [
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
];

// Utility: seed default therapies if none exist
async function ensureDefaultTherapies() {
  const count = await Therapy.countDocuments();
  if (count === 0) {
    const defaults = [
      {
        name: "Abhyanga",
        description: "Warm herbal oil full body massage",
        durationMin: 60,
      },
      {
        name: "Shirodhara",
        description: "Warm oil poured on forehead",
        durationMin: 45,
      },
      { name: "Swedana", description: "Herbal steam therapy", durationMin: 40 },
      {
        name: "Basti",
        description: "Therapeutic enema / detox",
        durationMin: 50,
      },
      { name: "Nasya", description: "Nasal therapy", durationMin: 30 },
    ];
    await Therapy.insertMany(defaults);
  }
}

// GET booking form
router.get("/new", isLoggedIn, async (req, res, next) => {
  try {
    await ensureDefaultTherapies();
    const therapies = await Therapy.find().sort({ name: 1 });
    // render form; prefill with req.user info
    res.render("schedule/new", {
      user: req.user,
      therapies,
      timeSlots: TIME_SLOTS,
    });
  } catch (err) {
    next(err);
  }
});

// POST create booking
router.post("/", isLoggedIn, async (req, res, next) => {
  try {
    const { therapy: therapyId, date: dateStr, timeSlot } = req.body;
    if (!therapyId || !dateStr || !timeSlot) {
      req.flash("error", "Please select therapy, date and time slot.");
      return res.redirect("/schedule/new");
    }

    // normalize date: keep date only (no time)
    const dateOnly = new Date(dateStr);
    dateOnly.setHours(0, 0, 0, 0);

    // block if that therapy/date/timeslot already booked
    const existing = await Schedule.findOne({
      therapy: therapyId,
      date: dateOnly,
      timeSlot,
    });
    if (existing) {
      req.flash(
        "error",
        "Selected slot already booked. Please choose another."
      );
      return res.redirect("/schedule/new");
    }

    // create booking
    const booking = new Schedule({
      patient: req.user._id,
      name: req.user.name || req.user.username || req.user.email,
      email: req.user.email,
      therapy: therapyId,
      date: dateOnly,
      timeSlot,
    });

    // prepare payload to encode in qr (plain JSON)
    const payload = {
      bookingId: booking._id, // not yet saved id (will be after save) - keep placeholder
      patientId: req.user.patientId || req.user._id,
      name: booking.name,
      email: booking.email,
      therapy: therapyId,
      date: dateOnly.toISOString().split("T")[0],
      timeSlot,
    };

    // save to get _id
    await booking.save();

    // update payload with proper booking id & therapy name
    const therapyObj = await Therapy.findById(therapyId);
    payload.bookingId = booking._id;
    payload.therapyName = therapyObj ? therapyObj.name : "";

    // generate QR as data URL (PNG)
    const qrBase64 = await QRCode.toDataURL(JSON.stringify(payload));
    booking.qrData = qrBase64;
    await booking.save();

    // redirect to success page
    return res.redirect(`/schedule/success/${booking._id}`);
  } catch (err) {
    // if unique index violation or other error
    console.error("Booking error:", err);
    req.flash("error", err.message || "Could not create booking.");
    return res.redirect("/schedule/new");
  }
});

// GET booking success (show QR + details)
router.get("/success/:id", isLoggedIn, async (req, res, next) => {
  try {
    const booking = await Schedule.findById(req.params.id)
      .populate("therapy")
      .populate("patient");
    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/schedule/new");
    }
    // ensure only owner or admin can view? For now owner check:
    if (!booking.patient.equals(req.user._id)) {
      req.flash("error", "You are not authorized to view this booking.");
      return res.redirect("/schedule/new");
    }
    res.render("schedule/success", { booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
