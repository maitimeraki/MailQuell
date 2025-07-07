# MailQuell

MailQuell is a modern email management application that helps users organize, filter, and manage their emails efficiently. Built with Node.js and Express, it integrates with Google's Gmail API to provide a seamless email management experience.

## Features

- **OAuth Authentication**: Secure login with Google account
- **Email Filtering**: Automatically categorize and organize emails
- **Custom Tags**: Create and manage custom tags for emails
- **Search Functionality**: Quickly find emails with advanced search
- **Profile Management**: View and manage your profile information
- **Responsive Design**: Works on desktop and mobile devices

## Installation

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
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REDIRECT_URI=your_redirect_uri
```

5. Start the application:
```bash
npm start
```

## API Routes

### Authentication Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth` | Initiates Google OAuth flow |
| GET | `/auth/google/callback` | Handles Google OAuth callback |
| GET | `/auth/logout` | Logs out the current user |
| GET | `/auth/status` | Checks if user is authenticated |

<!-- ### Email Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/emails` | Retrieves all emails for the authenticated user |
| GET | `/api/emails/:id` | Retrieves a specific email by ID |
| GET | `/api/emails/search` | Searches emails based on query parameters |
| POST | `/api/emails/tag` | Adds a tag to an email |
| DELETE | `/api/emails/tag` | Removes a tag from an email | -->

### Tag Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/tags/processTags` | Creates a new tag |

<!-- ### Profile Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/profile` | Retrieves the user's profile information |
| PUT | `/api/profile` | Updates the user's profile settings | -->

<!-- ### Dashboard Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Renders the main dashboard page |
| GET | `/dashboard/inbox` | Shows inbox emails |
| GET | `/dashboard/sent` | Shows sent emails |
| GET | `/dashboard/drafts` | Shows draft emails |
| GET | `/dashboard/trash` | Shows deleted emails | -->

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/home` | Main dashboard |
| `/profile` | User profile page |
| `/settings` | Application settings |

## Project Structure

```
MailSift/
├── Backend/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── public/          # Static files
│   │   ├── JavaScripts/ # Client-side JavaScript
│   │   ├── images/      # Image assets
│   │   └── stylesheets/ # CSS files
│   ├── routes/          # Express routes
│   ├── service/         # Business logic
│   ├── views/           # EJS templates
│   └── app.js           # Express application
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── package.json         # Project dependencies
└── README.md            # Project documentation
```

## Technologies Used

- **Backend**: Node.js, Express
- **Authentication**: Google OAuth 2.0
- **API Integration**: Gmail API
- **Frontend**: HTML, CSS, JavaScript
- **Templating**: EJS
- **Styling**: Custom CSS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Google Gmail API
- Express.js team
- Font Awesome for icons
