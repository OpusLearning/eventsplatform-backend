/**
 * controllers/calendarController.js
 *
 * Provides functions for:
 * 1. Generating the Google OAuth URL
 * 2. Handling the Google OAuth callback
 * 3. Adding events to a user’s Google Calendar
 * 4. Deleting events from Google Calendar
 * 5. Debugging token read/write logic
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Ensure environment variables are loaded

// Path to store tokens (could be a DB instead if you prefer)
const TOKEN_PATH = path.join(__dirname, "../tokens.json");

// Initialise OAuth2 client using environment variables
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Step 1: Generate Google OAuth URL
 * - We include `prompt: "consent"` to always request a refresh token,
 *   in case the user previously authorised the app and Google otherwise omits it.
 */
const authGoogle = (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar.events"],
      prompt: "consent", // Force re-consent for a fresh refresh token
    });

    console.log("[DEBUG] Redirecting user to Google OAuth:", authUrl);
    return res.redirect(authUrl);
  } catch (err) {
    console.error("[ERROR] Failed to generate Google OAuth URL:", err);
    return res.status(500).json({ error: "Internal server error - OAuth URL" });
  }
};

/**
 * Step 2: Handle Google OAuth Callback
 * - Exchanges the `code` parameter for Google OAuth tokens.
 * - Writes tokens to a JSON file (tokens.json).
 * - If Google does not send a new refresh token but we have an old one on file,
 *   we merge the old refresh token so we retain offline access.
 */
const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;
  console.log("[DEBUG] Received Google Auth Code:", code);

  if (!code) {
    return res.status(400).json({ error: "Missing authentication code in callback" });
  }

  try {
    // Exchange the code for tokens
    const response = await oauth2Client.getToken(code);
    console.log("[DEBUG] Full getToken response:", response);

    let { tokens } = response || {};
    if (!tokens) tokens = {};

    console.log("[DEBUG] Tokens received from Google:", tokens);

    // If there is no new refresh token, attempt to reuse an existing one
    if (!tokens.refresh_token) {
      console.log("[INFO] No new refresh_token from Google. Attempting to reuse stored token if available.");

      if (fs.existsSync(TOKEN_PATH)) {
        try {
          const existingTokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
          if (existingTokens.refresh_token) {
            tokens.refresh_token = existingTokens.refresh_token;
            console.log("[DEBUG] Reused existing refresh_token from tokens.json");
          }
        } catch (readErr) {
          console.error("[ERROR] Could not read existing tokens file:", readErr);
          // We can continue, but the user may have to re-auth if the token expires without a refresh token
        }
      }
    }

    // Check if at least an access token is present
    if (!tokens.access_token) {
      console.error("[ERROR] No access_token in token response:", tokens);
      return res.status(500).json({ error: "OAuth tokens missing from Google response" });
    }

    // Set credentials on the OAuth2 client
    oauth2Client.setCredentials(tokens);

    // Save tokens to file (for a real application, consider encrypting or storing in DB)
    try {
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      console.log("[DEBUG] Tokens successfully saved to:", TOKEN_PATH);
    } catch (writeErr) {
      console.error("[ERROR] Failed to write tokens to file:", writeErr);
      return res.status(500).json({ error: "Failed to save OAuth tokens" });
    }

    return res.send("Google Calendar authentication successful! You can now add events.");
  } catch (error) {
    console.error("[ERROR] Google Auth Callback failed:", error);
    return res.status(500).json({ error: "Google authentication failed" });
  }
};

/**
 * Step 3: Add an Event to Google Calendar
 * - Reads tokens from local file (tokens.json) and uses them to call the Calendar API.
 */
const addEvent = async (req, res) => {
  const { summary, description, startTime, endTime } = req.body;
  console.log("[DEBUG] Add event request received:", req.body);

  // Ensure tokens are stored locally
  if (!fs.existsSync(TOKEN_PATH)) {
    console.error("[ERROR] No stored tokens found at:", TOKEN_PATH);
    return res.status(401).json({ error: "User not authenticated with Google" });
  }

  // Read tokens from file
  let tokens;
  try {
    tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    console.log("[DEBUG] Tokens loaded from file:", tokens);
  } catch (readErr) {
    console.error("[ERROR] Failed to read tokens file:", readErr);
    return res.status(500).json({ error: "Failed to load stored tokens" });
  }

  // Apply credentials
  oauth2Client.setCredentials(tokens);

  // Create the Calendar instance
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Build the event object
  const event = {
    summary,
    description,
    start: { dateTime: startTime, timeZone: "UTC" },
    end: { dateTime: endTime, timeZone: "UTC" },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    console.log("[DEBUG] Event successfully added to Google Calendar:", response.data);
    return res.json({
      message: "Event added to Google Calendar!",
      event: response.data,
    });
  } catch (error) {
    console.error("[ERROR] Google Calendar API failed:", error);
    return res.status(500).json({ error: "Failed to add event to Google Calendar" });
  }
};

/**
 * Delete an event from Google Calendar
 * Expects an eventId parameter in the URL (e.g. /delete-event/:eventId).
 */
const deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  console.log("[DEBUG] deleteEvent called with eventId:", eventId);

  if (!eventId) {
    return res.status(400).json({ error: "Missing eventId parameter" });
  }

  // Ensure tokens are available
  if (!fs.existsSync(TOKEN_PATH)) {
    console.error("[ERROR] No tokens file found. User not authenticated yet.");
    return res.status(401).json({ error: "User not authenticated with Google" });
  }

  let tokens;
  try {
    tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  } catch (err) {
    console.error("[ERROR] Failed to read tokens file:", err);
    return res.status(500).json({ error: "Failed to load tokens" });
  }

  // Set credentials on the OAuth2 client
  oauth2Client.setCredentials(tokens);

  // Use Google Calendar API
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    // Perform the delete
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });

    console.log("[DEBUG] Event", eventId, "deleted successfully.");
    return res.json({ message: `Event ${eventId} deleted successfully` });
  } catch (error) {
    console.error("[ERROR] Failed to delete event from Google Calendar:", error);
    return res.status(500).json({ error: "Failed to delete event" });
  }
};

/**
 * Update an event in Google Calendar
 * Expects an eventId parameter in the URL (e.g. /update-event/:eventId).
 * Optionally, the request body can include summary, description, startTime, endTime.
 */
const updateEvent = async (req, res) => {
    const { eventId } = req.params;
    const { summary, description, startTime, endTime } = req.body;
  
    console.log("[DEBUG] updateEvent called with eventId:", eventId);
  
    if (!eventId) {
      return res.status(400).json({ error: "Missing eventId parameter" });
    }
  
    // Ensure tokens exist
    if (!fs.existsSync(TOKEN_PATH)) {
      console.error("[ERROR] No tokens file found. User not authenticated yet.");
      return res.status(401).json({ error: "User not authenticated with Google" });
    }
  
    let tokens;
    try {
      tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    } catch (err) {
      console.error("[ERROR] Failed to read tokens file:", err);
      return res.status(500).json({ error: "Failed to load tokens" });
    }
  
    // Apply the tokens to oauth2Client
    oauth2Client.setCredentials(tokens);
  
    // Build partial resource for updating
    // If a field is not provided, we simply omit it (so we don't overwrite it).
    const resource = {};
    if (summary !== undefined) resource.summary = summary;
    if (description !== undefined) resource.description = description;
    if (startTime !== undefined) {
      resource.start = { dateTime: startTime, timeZone: "UTC" };
    }
    if (endTime !== undefined) {
      resource.end = { dateTime: endTime, timeZone: "UTC" };
    }
  
    // Use Google Calendar API to patch (partially update) the event
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  
    try {
      const response = await calendar.events.patch({
        calendarId: "primary",
        eventId,
        resource,
      });
  
      console.log("[DEBUG] Event updated in Google Calendar:", response.data);
      return res.json({
        message: `Event ${eventId} updated successfully`,
        event: response.data,
      });
    } catch (error) {
      console.error("[ERROR] Failed to update event in Google Calendar:", error);
      return res.status(500).json({ error: "Failed to update event" });
    }
  };

  module.exports = {
    authGoogle,
    handleGoogleCallback,
    addEvent,
    deleteEvent,
    updateEvent, // new function
  };
  
