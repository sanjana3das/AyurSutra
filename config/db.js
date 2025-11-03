// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ayursutra";
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
