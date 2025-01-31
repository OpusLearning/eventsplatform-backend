/**
 * routes/calendar.js
 *
 * Defines Express routes for calendar-related functionality:
 * - /auth          : Kicks off OAuth with Google
 * - /callback      : Google redirect to exchange code for tokens
 * - /add-event     : Adds a new event to the authenticated user's Google Calendar
 * - /delete-event  : Deletes a specific event from the user's Google Calendar
 * - /test          : Simple route to check that calendar routes are working
 */

const express = require("express");
const {
  authGoogle,
  handleGoogleCallback,
  addEvent,
  deleteEvent,
  updateEvent, // Import the new updateEvent function
} = require("../controllers/calendarController");

const router = express.Router();

// Route to start Google OAuth authentication
router.get("/auth", authGoogle);

// Route to handle Google OAuth callback
router.get("/callback", handleGoogleCallback);

// Route to add an event to Google Calendar
router.post("/add-event", addEvent);

// NEW: Delete an event from Google Calendar
router.delete("/delete-event/:eventId", deleteEvent);


// NEW: Update an event
router.patch("/update-event/:eventId", updateEvent);

// Test route to confirm calendar routes are available
router.get("/test", (req, res) => {
  console.log("[DEBUG] Calendar test route invoked.");
  res.json({ message: "Calendar routes are working correctly!" });
});

module.exports = router;
