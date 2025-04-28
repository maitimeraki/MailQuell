const express = require("express");
const app = express();
const path = require("path");
const { google } = require("googleapis");
const fs = require("fs").promises;
const session = require("express-session");
const dotenv = require("dotenv");
var cors = require("cors");
const { auth } = require("google-auth-library");
dotenv.config();
const authenticationRoute = require("./routes/authentication.route");
// const deleteEmailsFromSender = require("./controllers/delFromSender");
const userRoute = require("./routes/user.route");
const tagsRoute = require('./routes/tagRoute.route');

// const PORT = process.env.PORT || 8000;
// Add CORS middleware
app.set('view engine', 'ejs')
app.use(cors({
  origin:[ 'http://127.0.0.1:5500','http://localhost:3000/'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization","Accept"]
}));
app.use(express.static(path.join(__dirname, 'public')));
// Add body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Add session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use('/users', authenticationRoute);
app.use('/', userRoute);
app.use('/tags', tagsRoute);


module.exports = app;