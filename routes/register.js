const express = require("express");
const router = express.Router();
const User = require("../models/patient.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const QRCode = require("qrcode"); // <-- required for QR
router.get("/register", (req, res) => {
  // res.send("working");

  res.render("register.ejs");
});
// REGISTER (Patient Signup) - generate QR and save it
router.post(
  "/register",
  wrapAsync(async (req, res, next) => {
    try {
      const { name, email, password, phone, age, gender, address } = req.body;

      const newUser = new User({ name, email, phone, age, gender, address });
      const registeredUser = await User.register(newUser, password);

      const qrPayload = {
        patientId: registeredUser.patientId,
        name: registeredUser.name,
        email: registeredUser.email,
        phone: registeredUser.phone,
        age: registeredUser.age,
        gender: registeredUser.gender,
        address: registeredUser.address,
        role: registeredUser.role,
        createdAt: registeredUser.createdAt,
      };

      const qrString = JSON.stringify(qrPayload);
      const qrBase64 = await QRCode.toDataURL(qrString);

      registeredUser.qrData = qrBase64;
      await registeredUser.save();

      //  AUTO LOGIN
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome! Registration successful.");
        console.log("resistered");
        return res.render("login.ejs");

        return res.redirect("/");
      });
    } catch (err) {
      console.error("Registration error:", err);
      req.flash("error", err.message);
      return res.redirect("/register.ejs");
    }
  })
);

module.exports = router;
