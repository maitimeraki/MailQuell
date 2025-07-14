const express = require("express");
const path = require("path");
const { google } = require("googleapis");
const session = require("express-session");
const dotenv = require("dotenv");
var cookieParser = require('cookie-parser')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const cors = require('cors');
const morgan = require('morgan');
const { auth } = require("google-auth-library");
const authenticationRoute = require("./routes/authentication.route");
const userRoute = require("./routes/user.route");
const tagsRoute = require('./routes/tagRoute.route');
const profileRoute = require("./routes/profile.route");


const app = express();
dotenv.config();

app.set('view engine', 'ejs')
app.use(cookieParser())

app.use(cors({
  origin: ["https://mailquell.com"],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// Add body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());                        // Set secure HTTP headers
app.use(xssClean());                      // Prevent XSS attacks
app.use(mongoSanitize());                // Prevent NoSQL injection
app.use(morgan('combined'));

// Add session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// app.get('/', (req, res) => {
//   res.render("index")
// });

app.use(profileRoute);
app.use('/users', authenticationRoute);
app.use('/', userRoute);
app.use('/tags', tagsRoute);


module.exports = app;