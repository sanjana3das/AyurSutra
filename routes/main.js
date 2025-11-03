const express = require("express");
const router = express.Router();

router.get("/ayursutra", (req, res) => {
  res.render("landing.ejs");
});

module.exports = router;
