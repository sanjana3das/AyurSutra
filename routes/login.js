const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/patient.js");

// SHOW LOGIN FORM
router.get("/login", (req, res) => {
  res.render("login.ejs");
});

// LOGIN POST ROUTE
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
 const redirectUrl = req.session.redirectUrl || "/patient/dashboard";

        delete req.session.redirectUrl;
        res.redirect(redirectUrl);
  }
);

// LOGOUT
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/login");
  });
});

module.exports = router;
