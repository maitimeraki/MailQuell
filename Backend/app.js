const path = require("path");
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require("dotenv");
const express = require("express");
const { connectdb } = require("./db/db");
const xssClean = require('xss-clean');
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
// const promClient = require("prom-client");
var cookieParser = require('cookie-parser');
// const { google } = require("googleapis");
// const cookieSession = require("cookie-session");
// const { auth } = require("google-auth-library");
const mongoSanitize = require('express-mongo-sanitize');

const webHookRoute = require('./routes/webHook.route');
const userRoute = require("./routes/user.route");
// const {autoLogin} = require("./middlewares/autoLogin");
const tagsRoute = require('./routes/tagRoute.route');
const { redisClient } = require("./config/redis")
const profileRoute = require("./routes/profile.route");
const { gmailWorkerHandler } = require("./workers/gmailWorker");
const authenticationRoute = require("./routes/authentication.route");
const metricsRoute = require("./metrics/metrics.route/metrics.route");
//Database connection 
async function initApp() {
    try {
        // 1. Connect to Database FIRST
        await connectdb(); 
        console.log("✅ Database connected successfully");

        // 2. Start Worker ONLY after DB is ready
        gmailWorkerHandler(redisClient);

    } catch (err) {
        console.error("❌ Failed to start app:", err);
        process.exit(1);
    }
}

initApp();

const app = express();
dotenv.config();

// Middleware setup
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
  origin: ["http://localhost:3000", "http://localhost:5173", "https://detractingly-osseous-margarete.ngrok-free.dev"], // Whatever you put frontend url in the .env file that should go here, by chance if put "http://localhost:5173/" instead of "http://localhost:5173"(In the .env file have url "http://localhost:5173")then must have whatever in the .env file.
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "Access-Control-Allow-Origin", "Cookie"],
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



//Connect to localhost on port 6379.
// const redisClient = Redis.createClient({
//   url: process.env.REDIS_URL || "redis://localhost:6379"
// });


// redisClient.on("error", err => console.log("Redis Client error :", err));

// redisClient.connect().then(() => console.log("Redis Client connected")).catch(err => console.log("Redis connection error :", err));


// Add session middleware


app.use(session({
  //If you have multiple apps using the same Redis instance, prefixes prevent conflicts
  store: new RedisStore({ client: redisClient, prefix: `sess:${process.env.NODE_ENV || 'dev'}:` }),
  name: "connect.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use("/monitor", metricsRoute);
app.use('/webhook', webHookRoute);
app.use(profileRoute);
app.use('/users', authenticationRoute);
app.use('/', userRoute);
app.use('/api', tagsRoute);


module.exports = app;