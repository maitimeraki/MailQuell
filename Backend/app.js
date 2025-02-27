const express = require("express");
const app = express();
const { google } = require("googleapis");
const fs = require("fs").promises;
const session = require("express-session");
const dotenv = require("dotenv");
var cors = require("cors");
const { auth } = require("google-auth-library");
dotenv.config();
const authentication = require("./routes/authentication.route");
const watchGmail = require("./routes/watchGmail.route");
const deleteEmailsFromSender = require("./controllers/delFromSender");
// const PORT = process.env.PORT || 8000;
// Add CORS middleware
        app.use(cors({
        origin:  'http://127.0.0.1:5500' ,
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
        }));

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
app.use('/users', [authentication]);
app.use('/users', [watchGmail]);

// API endpoint to trigger deletion      
            // app.post('/delete-emails', async (req, res) => {
            //   try {
            //     const { from } = req.body;
            //     const result = await deleteEmailsFromSender(from.senderEmail);
            //     res.json({ message: result });
            //   } catch (error) {
            //     res.status(500).json({ error: error.message });
            //   }
            // });

module.exports = app;