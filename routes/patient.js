const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js"); // include middleware

router.get("/dashboard", isLoggedIn, (req, res) => {
  res.render("patient/book.ejs", { user: req.user });
});

module.exports = router;
