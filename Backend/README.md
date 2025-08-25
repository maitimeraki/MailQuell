# MailQuell
A Modern Email Management App

MailQuell is a modern email management application that helps users organize, filter, and manage their emails efficiently. Built with Node.js and Express, it integrates with Google's Gmail API to provide seamless email management.

## Features

- **OAuth Authentication**: Secure login with Google account
- **Email Filtering**: Automatically categorize and organize emails
- **Custom Tags**: Create and manage custom tags for emails
- **Search Functionality**: Quickly find emails with advanced search
- **Profile Management**: View and manage your profile information
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express
- **Authentication**: Google OAuth 2.0
- **API Integration**: Gmail API
- **Frontend**: HTML, CSS, JavaScript
- **Templating**: EJS
- **Styling**: Custom CSS

## Installation (Local Setup)

1. Clone the repository:
   ```bash
   git clone https://github.com/anupammaiti10/MailQuell.git
   ```
2. Navigate to the project directory:
   ```bash
   cd MailQuell
   ```
3. Install dependencies:
   ```bash                                                                      
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   GMAIL_CLIENT_ID=your_google_client_id
   GMAIL_CLIENT_SECRET=your_google_client_secret
   GMAIL_REDIRECT_URI=your_redirect_uri
   SESSION_SECRET=your_session_secret
   PORT=3000
   ```
5. Start the application:
   ```bash
   npm start
   ```

## AWS EC2 Deployment

### Prerequisites

- AWS account
- EC2 instance running Ubuntu (recommended)
- SSH access to the EC2 instance

### Steps

1. **Connect to EC2 via SSH**
   ```bash
   ssh -i /path/to/your-key.pem ubuntu@your-ec2-public-ip
   ```

2. **Install Node.js, npm, and Git**
   ```bash
   sudo apt-get update
   sudo apt-get install -y nodejs npm git
   ```

3. **Clone the repository**
   ```bash
   git clone https://github.com/anupammaiti10/MailQuell.git
   cd MailQuell
   npm install
   ```

4. **Configure environment variables**

   Create a `.env` file in the `MailQuell` directory:
   ```
   GMAIL_CLIENT_ID=your_google_client_id
   GMAIL_CLIENT_SECRET=your_google_client_secret
   GMAIL_REDIRECT_URI=your_redirect_uri
   SESSION_SECRET=your_session_secret
   PORT=3000
   ```

5. **(Optional) Use pm2 for process management**
   ```bash
   sudo npm install -g pm2
   pm2 start Backend/app.js
   pm2 startup
   pm2 save
   ```

   *(Optional) Set up nginx as a reverse proxy for production deployments.*

6. **Open HTTP/HTTPS ports**

   - In your AWS EC2 console, edit the Security Group attached to your instance.
   - Allow inbound rules for port 80 (HTTP) and 443 (HTTPS).

7. **Domain Setup (Optional)**

   - Use Route 53 to configure a custom domain.
   - Set up SSL with Let’s Encrypt:
     ```bash
     sudo apt-get install -y certbot python3-certbot-nginx
     sudo certbot --nginx
     ```

### Environment Variables

- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REDIRECT_URI`
- `SESSION_SECRET`
- `PORT`

## Usage

**Locally:**  
```bash
npm start
```

**On EC2 with pm2:**  
```bash
pm2 start Backend/app.js
```

Access the app in your browser via `http://<your-ec2-public-ip>:3000` or your domain.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
