const axios = require('axios');
const CLIENT_ID = 'uveX3ZbSPyHwFpyHDszEg';
const CLIENT_SECRET = 'xAaEIw7oBsTgR5V6Bt76PmmMd5Aa9A5y';

const createZoomMeeting = async (title, date, startTime, endTime) => {
  try {
    const apiUrl = 'https://api.zoom.us/v2/users/me/meetings';

    const startTimeObj = new Date(`${date} ${startTime}`);
    const endTimeObj = new Date(`${date} ${endTime}`);

    const requestData = {
      topic: title,
      type: 2, // Scheduled meeting
      start_time: startTimeObj.toISOString(),
      duration: Math.floor((endTimeObj - startTimeObj) / (1000 * 60)), // Meeting duration in minutes
    };

    const response = await axios.post(apiUrl, requestData, {
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET,
      },
    });

    return response.data.join_url;
  } catch (error) {
    console.error('Error creating Zoom meeting:', error.message);
    throw error;
  }
};

module.exports = createZoomMeeting;