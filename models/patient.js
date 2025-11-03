const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    address: { type: String },

    role: {
      type: String,
      enum: ["patient", "therapist", "admin"],
      default: "patient",
    },

    qrData: { type: String }, // ✅ optional initially

    patientId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate patient ID
userSchema.pre("save", async function (next) {
  if (!this.patientId) {
    const count = await mongoose
      .model("User")
      .countDocuments({ role: "patient" });
    this.patientId = `AYR-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", userSchema);
