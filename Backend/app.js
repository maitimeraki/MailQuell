const path = require("path");
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require("dotenv");
const express = require("express");
const xssClean = require('xss-clean');
const { google } = require("googleapis");
const session = require("express-session");
var cookieParser = require('cookie-parser')
const cookieSession = require("cookie-session");
const { auth } = require("google-auth-library");
const mongoSanitize = require('express-mongo-sanitize');

const userRoute = require("./routes/user.route");
const tagsRoute = require('./routes/tagRoute.route');
const profileRoute = require("./routes/profile.route");
const authenticationRoute = require("./routes/authentication.route");

const app = express();
dotenv.config();

app.use(cookieParser());
app.set('view engine', 'ejs')

// app.use(cookieSession({
//   name: 'session',
//   keys: [process.env.SESSION_SECRET],
//   maxAge: 24 * 60 * 60 * 1000,
//   secure: process.env.NODE_ENV === 'production',
//   httpOnly: true,
// }));

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"], // Whatever you put frontend url in the .env file that should go here, by chance if put "http://localhost:5173/" instead of "http://localhost:5173"(In the .env file have url "http://localhost:5173")then must have whatever in the .env file
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

app.use(profileRoute);
app.use('/users', authenticationRoute);
app.use('/', userRoute);
app.use('/tags', tagsRoute);


module.exports = app;