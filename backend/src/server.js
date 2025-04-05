const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const { Strategy: LinkedInStrategy } = require('passport-linkedin-oauth2');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Configure session
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure LinkedIn Strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL,
  scope: ['r_emailaddress', 'r_liteprofile'],
  state: true
}, (accessToken, refreshToken, profile, done) => {
  // Store the access token for later use
  profile.accessToken = accessToken;
  return done(null, profile);
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routes

// LinkedIn authentication routes
app.get('/auth/linkedin', passport.authenticate('linkedin'));

app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/failure'
  })
);

// Success and failure redirects
app.get('/auth/success', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/linkedin/success.html?user=${encodeURIComponent(JSON.stringify(req.user))}`);
});

app.get('/auth/failure', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/linkedin/failure.html`);
});

// API route to fetch LinkedIn profile data
app.get('/api/linkedin/profile', async (req, res) => {
  if (!req.isAuthenticated() || !req.user || !req.user.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Get basic profile from LinkedIn API
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${req.user.accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Get email address
    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${req.user.accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Parse and format profile data
    const firstName = profileResponse.data.localizedFirstName;
    const lastName = profileResponse.data.localizedLastName;
    const email = emailResponse.data.elements[0]['handle~'].emailAddress;

    // In a real application, you'd make additional API calls to get:
    // - Profile photo: /v2/me?projection=(profilePicture(displayImage~:playableStreams))
    // - Headline: /v2/me?projection=(headline)
    // - Current position: /v2/positions
    // - Education: /v2/educations
    // - Skills: /v2/skills

    // For now, return basic profile data
    const profileData = {
      fullName: `${firstName} ${lastName}`,
      headline: req.user.headline || 'LinkedIn Member', // This would come from additional API calls
      email: email,
      phone: '',  // LinkedIn API doesn't provide phone number
      location: req.user.location?.name || '',
      summary: '',
      experience: [],
      education: [],
      skills: []
    };

    res.json(profileData);
  } catch (error) {
    console.error('LinkedIn API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch LinkedIn profile data' });
  }
});

// Logout route
app.get('/auth/logout', (req, res) => {
  req.logout();
  res.redirect(process.env.FRONTEND_URL);
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 