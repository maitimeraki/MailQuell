const express = require("express");
const app = express();
const { google } = require("googleapis");
const fs = require("fs").promises;
const session = require("express-session");
const dotenv = require("dotenv");
const cors=require("cors");
dotenv.config();
const PORT = process.env.PORT || 8000;
// Add CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

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
// Add logging middleware
// app.use((req, res, next) => {
//   console.log('Session ID:', req.sessionID);
//   console.log('Session State:', req.session.oauthState);

//   next();
// });


const CREDENTIALS = require("./credentials.json");
const { client_secret, client_id, redirect_uris } = CREDENTIALS.installed;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Redirect for authentication
app.get("/auth", (req, res) => {
  try {

    // Add state parameter
    const state = Math.random().toString(36).substring(7);
    req.session.oauthState = state;
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ['https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.labels',
        'https://www.googleapis.com/auth/gmail.settings.basic',
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/pubsub',  // Add PubSub scope
        'https://www.googleapis.com/auth/cloud-platform'],
      state: state,
      prompt: "consent"
    });
    console.log("Auth initiated with state:", state);
    res.redirect(authUrl);
  } catch (e) {
    console.error("Auth error:", e);
    res.status(500).send("Authentication failed");
  }
});

// Callback handler
app.get("/auth/google/callback", async (req, res) => {
  try {
    if (!req.session.oauthState) {
      throw new Error("No state in session");
    }
    // Verify state parameter
    if (req.query.state !== req.session.oauthState) {
      console.error("State mismatch");
      return res.status(400).send("Invalid state parameter");
    }
    console.log("Authorization code received:", req.query.code); // Log the received code
    const { tokens } = await oAuth2Client.getToken(req.query.code);

    // Check if a refresh token is included and handle it
    if (tokens.refresh_token) {
      console.log("Save the refresh token:", tokens.refresh_token);
      // Save the refresh token (e.g., in a database or file)
      // process.env.USER_REFRESH_TOKEN = tokens.refresh_token;
    }

    oAuth2Client.setCredentials(tokens);

    console.log("Tokens received:", tokens); // Log the received tokens
    // Save tokens to file
    await fs.writeFile("token.json", JSON.stringify(tokens));

    res.redirect('/watch');
    // Clear state after use
    delete req.session.oauthState;
    req.session.save();
    // res.send("Authentication successful! You can close this tab.");
  } catch (error) {
    console.error('Auth Error:', error.response);
    res.status(400).send(error.message);
  }
});
// app.get("/success", (req, res) => {
//   res.send("Authentication successful! You can close this tab.");
// });
// Watch Gmail function
async function watchGmail(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const topicName = `projects/${process.env.PROJECT_ID}/topics/${process.env.TOPIC_NAME}`;

  try {
    const response = await gmail.users.watch({
      userId: "me",
      requestBody: {
        labelIds: ["INBOX"],       
        topicName: topicName,
      },
    });
    console.log("Watch response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error setting up Gmail watch:", error.response);
    throw error;
  }
}
// Endpoint to initiate watching
app.get("/watch", async (req, res) =>{
  try {
    // Load tokens from file
    const tokenData = await fs.readFile("token.json", "utf-8");
    const tokens = JSON.parse(tokenData);

    // Set credentials for oAuth2Client
    oAuth2Client.setCredentials(tokens);

    // Call the watch function
    const response = await watchGmail(oAuth2Client);
    res.send("Watch initiated successfully. History ID: " + response.historyId);
  } catch (error) {
    console.error("Error watching Gmail:", error.message);
    res.status(500).send("Failed to initiate watch.");
  }
});
// async function verifyAuthentication() {
//   try {
//     const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
//     await gmail.users.getProfile({ userId: 'me' });
//     return true;
//   } catch (error) {
//     console.error('Authentication error:', error.message);
//     return false;
//   }
// }
async function deleteEmailsFromSender(senderEmail) {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Search for messages from specific sender
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `from:${senderEmail}`,
      // maxResults: 20
    });

    if (response.data.messages && response.data.messages.length > 0) {
      for (const message of response.data.messages) {
        try {
          // First remove from inbox
        const email=await gmail.users.messages.modify({
            userId: 'me',
            id: message.id,
            requestBody: {
              removeLabelIds: ['INBOX' ]
            }
          });
          console.log(email);
          // Then permanently delete
          // await gmail.users.messages.delete({
          //   userId: 'me',
          //   id: message.id
          // });
          
          // console.log(`Successfully deleted message: ${message.id}`);
        } catch (err) {
          console.error(`Error processing message ${message.id}:`, err.message);
        }
      }
      return `Successfully deleted ${response.data.messages.length} messages from ${senderEmail}`;
    }
    return `No messages found from ${senderEmail}`;
  } catch (error) {
    console.error('Error deleting emails:', error);
    throw error;
  }
}
// Webhook endpoint to receive notifications
app.post('/webhook', async (req, res) => {
  try {
    // if (!(await verifyAuthentication())) {
    //   throw new Error('Authentication failed or expired');
    // }
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Get the latest message
    const messages = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20 //Limit to the latest message
    });
    // console.log(messages);
    if (!messages.data.messages) {
      return res.status(200).send('No messages to process');
    }
    if (messages.data.messages && messages.data.messages.length > 0) {
      for (const message of messages.data.messages) {
         
        // console.log('Message ID:', messageId);
      // Get message details
      const messageDetails = await gmail.users.messages.get({
        userId: 'me',
          id: message.id,
          format: 'full'
      });
      // console.log(message);
      // Extract email details
      const headers = messageDetails.data.payload.headers;
      // console.log(headers);
      // const to = headers.find(h => h.name === 'To')?.value;
      const Email = {
        subject:headers.find(h => h.name === 'Subject')?.value,
        from:headers.find(h => h.name === 'From')?.value,
      }
      // const subject = headers.find(h => h.name === 'Subject')?.value;
      // const from = headers.find(h => h.name === 'From')?.value;
      // console.log('New Email Received:');
      // console.log('From:', from);
      // console.log('Subject:', subject);
      // console.log(Email);
// Add this check before deleting emails
      if (Email.from === "Anupam Maiti <maitianupam567@gmail.com>"){
        await deleteEmailsFromSender(Email.from);
      console.log(`Deleted emails from: ${Email.from}`);
      }
    }
    }
    res.status(200).send('Notification processed');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send(error.message);
  }
});           
// async function deleteEmailsFromSender(senderEmail) {
//   try {
//     const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

//     // Search for messages from specific sender
//     const response = await gmail.users.messages.list({
//       userId: 'me',
//       q: `From:${senderEmail}`,
//       maxResults: 20     // Limit to recent messages
//     });

//     if (response.data.messages && response.data.messages.length > 0) {
// //  // Permanently delete each matching message
//       //  for (const message of response.data.messages) {
//       //   await gmail.users.messages.delete({
//       //     userId: 'me',
//       //     id: message.id
//       //   });
//       //   console.log(`Permanently deleted message: ${message.id}`);
//       // }
//       // return `Permanently deleted ${response.data.messages.length} messages from ${senderEmail}`;
//       // Delete each matching message
//       for (const message of response.data.messages) {
//         await gmail.users.messages.trash({
//           userId: 'me',
//           id: message.id
//         });
//         console.log(`Deleted message: ${message.id}`);
//       }
//       return `Deleted ${response.data.messages.length} messages from ${senderEmail}`;
//     }

//     return `No messages found from ${senderEmail}`;
//   } catch (error) {
//     console.error('Error deleting emails:', error);
//     throw error;
//   }
// }
// Add this function to check auth status
 
 
// API endpoint to trigger deletion
app.post('/delete-emails', async (req, res) => {
  try {              
    const { from } = req.body;
    const result = await deleteEmailsFromSender(from.senderEmail);
    res.json({ message: result });
  } catch (error) {                 
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://${process.env.HOST}:${PORT}`);
});