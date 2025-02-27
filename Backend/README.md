# Gmail_NotificationRepo

A web application for managing Gmail messages with OAuth2 authentication and automated email processing capabilities.

## Features

- OAuth2 authentication with Gmail API
- Automatic email monitoring using Gmail push notifications
- Email management interface
- Ability to fetch and filter emails from specific senders
- Automated email cleanup functionality
- CORS-enabled API endpoints

## Tech Stack

- **Backend:**

  - Node.js
  - Express.js
  - Google APIs (Gmail API)
  - Express Session
  - dotenv for environment variables

- **Frontend:**
  - HTML5
  - CSS3
  - Vanilla JavaScript
  - Responsive design

## Setup

1. Create a Google Cloud Project and enable Gmail API
2. Configure OAuth2 credentials
3. Add credentials.json to Backend folder
4. Create .env file with required environment variables:
   - PORT
   - HOST
   - SESSION_SECRET
   - PROJECT_ID
   - TOPIC_NAME

## Installation

```bash
# Install backend dependencies
cd Backend
npm install

# Start server
node index.js

# Frontend can be served using any static file server
```
