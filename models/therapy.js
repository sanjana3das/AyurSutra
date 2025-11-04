const mongoose = require("mongoose");

const therapySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  duration: Number, // in minutes
  price: Number,
});

module.exports = mongoose.model("Therapy", therapySchema);
