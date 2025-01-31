// backend/src/utils/tokenUtils.js

const { google } = require("googleapis");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const refreshAccessToken = async (refreshToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "/api/auth/oauth2callback" // Backend's OAuth callback URL
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
};

module.exports = {
  refreshAccessToken,
};
