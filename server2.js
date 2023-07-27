const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const axios = require('axios');
const jwt = require('jsonwebtoken');

// const API_KEY = 'uveX3ZbSPyHwFpyHDszEg';
// const API_SECRET = 'xAaEIw7oBsTgR5V6Bt76PmmMd5Aa9A5y';

const CLIENT_ID = 'uveX3ZbSPyHwFpyHDszEg';
const CLIENT_SECRET = 'xAaEIw7oBsTgR5V6Bt76PmmMd5Aa9A5y';
const REDIRECT_URI = 'https://bookeventolive.netlify.app/';

let access_token = null;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/auth/zoom', (req, res) => {
    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
    res.redirect(authUrl);
  });

  app.get('/api/v1/auth/zoom/callback', async (req, res) => {
    const { code } = req.query;
  console.log(code,'code');
    try {
      const tokenResponse = await axios.post('https://zoom.us/oauth/token', null, {
        params: {
          grant_type: 'authorization_code',
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
        },
      });
      console.log('Zoom Token Response:', tokenResponse.data);
    //   const accessToken = tokenResponse.data.access_token;
      process.env.ZOOM_ACCESS_TOKEN = tokenResponse.data.access_token;
    //   access_token = accessToken
      // Save the access token to use it later for API calls.
  
      res.send('Successfully authenticated with Zoom!');
    } catch (error) {
    //   console.error(error);
      res.status(500).send('Error authenticating with Zoom.');
    }
  });
  app.post('/api/v1/create-meeting', async (req, res) => {
    const accessToken = process.env.ZOOM_ACCESS_TOKEN; // Retrieve the access token from where you saved it during the OAuth flow.
  
    try {
      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic: req.body.topic,
          type: req.body.type || 2, // Default meeting type: 2 (Scheduled)
          start_time: req.body.start_time,
          duration: req.body.duration || 60, // Default meeting duration: 60 minutes
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const meetingURL = response.data.join_url;
  
      // Send the meeting URL to the frontend as part of the API response.
      res.json({ meetingURL });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating Zoom meeting' });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });