# Resume Builder Backend (LinkedIn Integration)

This is the backend server for the Resume Builder application, specifically handling the LinkedIn API integration to import user profiles.

## Setup Instructions

### 1. Create a LinkedIn Developer App

1. Go to the [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Click on "Create App"
3. Fill in the required information:
   - App name: "Resume Builder"
   - Company: Your company name (or personal name)
   - Privacy Policy URL: Your privacy policy URL (can be a placeholder for development)
   - Business email: Your email
4. Click "Create App"
5. Under "Auth" tab:
   - Add authorized redirect URLs: `http://localhost:5000/auth/linkedin/callback`
   - Request the following OAuth 2.0 scopes:
     - `r_emailaddress`
     - `r_liteprofile`
6. Copy your Client ID and Client Secret (you'll need these for the next step)

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Edit the `.env` file and replace the placeholder values with your LinkedIn API credentials:
   ```
   LINKEDIN_CLIENT_ID=your_client_id_here
   LINKEDIN_CLIENT_SECRET=your_client_secret_here
   ```

### 3. Install Dependencies

```
npm install
```

### 4. Start the Server

For development (with auto-reload):
```
npm run dev
```

For production:
```
npm start
```

The server will start on port 5000 (or the port specified in your .env file).

## API Endpoints

- `GET /auth/linkedin` - Initiates the LinkedIn OAuth flow
- `GET /auth/linkedin/callback` - Callback URL for LinkedIn OAuth
- `GET /api/linkedin/profile` - Fetches the user's LinkedIn profile data (requires authentication)
- `GET /auth/logout` - Logs out the current user

## Frontend Integration

The frontend expects the LinkedIn user data to be stored in `localStorage` under the key `linkedinUser`. When the backend authentication is successful, the user is redirected to `/linkedin/success.html?user=...` with the user data in the URL parameter, which is then stored in localStorage.

## Limitations

Due to LinkedIn API limitations, only basic profile data is available:
- Basic profile (name, email)
- Limited work experience and education
- Limited skills data

In a production environment, you would need to request additional scopes and implement more comprehensive API calls to fetch detailed profile information.

## Troubleshooting

- If you encounter CORS issues, make sure the `FRONTEND_URL` in your `.env` file matches your frontend's URL
- For authentication problems, verify your Client ID and Client Secret
- LinkedIn API sometimes returns rate-limiting errors, so implement appropriate retry logic for production use 