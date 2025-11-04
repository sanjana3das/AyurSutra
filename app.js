// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError");

const User = require("./models/patient.js");

// initialize app FIRST
const app = express();

// DB connection
const connectDB = require("./config/db");
connectDB();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));

// session
const sessionOption = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOption));
app.use(flash());

// passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// view engine
// app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));

// flash + current user middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
const mainRoutes = require("./routes/main");
app.use("/", mainRoutes);

const userRoutes = require("./routes/register.js");
app.use("/", userRoutes);

const loginRoutes = require("./routes/login.js");
app.use("/", loginRoutes);

const patientRoutes = require("./routes/patient.js");
app.use("/patient", patientRoutes);

const scheduleRoutes = require("./routes/schedule.js");
app.use("/schedule", scheduleRoutes);


// 404 error handler
// app.use((req, res, next) => {
//   next(new ExpressError(404, "Page Not Found"));
// });

// // global error handler
// app.use((err, req, res, next) => {
//   const { statusCode = 500, message = "Something went Wrong" } = err;
//   res.status(statusCode).render("error.ejs", { message });
// });

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
