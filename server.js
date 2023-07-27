const express = require('express');
const axios = require('axios');
const  createZoomMeeting = require('./zoommeeting');
const cors = require('cors');

const app = express();
const port = 5000;
app.use(express.json());
const CLIENT_ID = 'su0jFAiWSgqqwB5elRYk3A'; // Replace with your Zoom OAuth Client ID
const CLIENT_SECRET = 'cpLuqyn5C48ZTaTEa1dkl7UtPzL5gKP7';
// Handle CORS - Replace example.com with your React frontend domain
app.use(cors({
  origin: 'https://2a85-183-82-122-12.ngrok-free.app', // Replace with the actual origin of your frontend
  methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));

app.get('/zoom-token', async (req, res) => {
  try {
    const redirectUri = req.query.redirectUri;
    console.log(req.query.code,redirectUri,'redirect');
    // Request Zoom access token using authorization code (from the frontend)
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: redirectUri,
      },
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error getting Zoom access token:', error.message);
    res.status(500).json({ error: 'Failed to get Zoom access token' });
  }
});

app.post('/create-zoom-meeting', async (req, res) => {
  try {
    const { title, date, startTime, endTime, accessToken } = req.body;

    // Make authenticated request to the Zoom API to create a meeting
    const apiUrl = 'https://api.zoom.us/v2/users/me/meetings';
    const startTimeObj = new Date(`${date} ${startTime}`);
    const endTimeObj = new Date(`${date} ${endTime}`);

    const requestData = {
      topic: title,
      type: 2, // Scheduled meeting
      start_time: startTimeObj.toISOString(),
      duration: Math.floor((new Date(endTimeObj) - new Date(startTimeObj)) / (1000 * 60)),
    };
    console.log(requestData,'requestdata');
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`,
      },
    });
    console.log(response.data.join_url,'response.data.join_url');
    res.json({ zoomMeetingUrl: response.data.join_url });
  } catch (error) {
    console.error('Error creating Zoom meeting:', error.message);
    if (error.response) {
      console.error('Zoom API Error:', error.response.data);
      res.status(error.response.status).json({ error: error.response.data.message });
    } else {
      res.status(500).json({ error: 'Failed to create Zoom meeting' });
    }
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});