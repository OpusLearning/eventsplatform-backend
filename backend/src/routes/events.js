/**
 * routes/events.js
 *
 * This module provides a comprehensive suite of API endpoints for managing community events.
 * It supports both public access for event discovery and secured administrative operations.
 *
 * Endpoint Overview:
 *
 * GET /api/events
 *   - Retrieves a complete list of events available on the platform.
 *     (Accessible to all users)
 *
 * POST /api/events
 *   - Creates a new event entry in the system.
 *     (Restricted to administrators)
 *
 * POST /api/events/signup
 *   - Registers the authenticated user for a specified event.
 *
 * PUT /api/events/:id
 *   - Updates the details of an existing event identified by its unique ID.
 *     (Restricted to administrators)
 *
 * DELETE /api/events/:id
 *   - Deletes an event from the database using its unique ID.
 *     (Restricted to administrators)
 */


const express = require("express");
const { Event, User, SignUp } = require("../models");
const { body, validationResult } = require("express-validator");
const { authenticateJWT } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authorize.js");

const router = express.Router();

console.log("[DEBUG] events.js is loaded");


router.get("/health", (req, res) => {
  res.status(200).json({ message: "Events API is running" });
});


router.get("/", async (req, res) => {
  try {
    console.log("[DEBUG] Fetching all events");
    const events = await Event.findAll();
    res.status(200).json(events);
  } catch (error) {
    console.error("[ERROR] Failed to fetch events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});


// Create a New Event (Admin Only)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("location").notEmpty().withMessage("Location is required"),
    // imageUrl is optional; no extra validation unless you want to check for URL format
  ],
  async (req, res) => {
    console.log("[DEBUG] POST /api/events called");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("[ERROR] Validation failed:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, date, location, imageUrl } = req.body;
      console.log(`[DEBUG] Creating Event: ${title} on ${date} at ${location}`);
      // Save imageUrl if provided; otherwise, store null.
      const newEvent = await Event.create({ 
        title, 
        date, 
        location, 
        imageUrl: imageUrl || null 
      });
      console.log("[DEBUG] Event Created:", newEvent);
      res.status(201).json({
        message: "Event created successfully",
        event: newEvent,
      });
    } catch (error) {
      console.error("[ERROR] Event Creation Failed:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);



router.post(
  "/signup",
  authenticateJWT,
  body("eventId").notEmpty().withMessage("eventId is required"),
  async (req, res) => {
    console.log("[DEBUG] POST /api/events/signup called");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("[ERROR] Validation failed:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    const { eventId } = req.body;

    console.log(`[DEBUG] Signing up user ID: ${userId} for event ID: ${eventId}`);

    if (!userId) {
      return res.status(403).json({ error: "Unauthorized: No user attached to request" });
    }

    try {
      const event = await Event.findByPk(eventId);
      if (!event) {
        console.error(`[ERROR] Event ${eventId} not found`);
        return res.status(404).json({ error: `Event with ID ${eventId} not found` });
      }

      const existingSignup = await SignUp.findOne({
        where: { UserId: userId, EventId: eventId },
      });
      if (existingSignup) {
        console.error(`[ERROR] User ${userId} already signed up for event ${eventId}`);
        return res.status(400).json({ error: "User is already signed up for this event" });
      }

      await SignUp.create({ UserId: userId, EventId: eventId });

      console.log(`[DEBUG] User ${userId} successfully signed up for event ${eventId}`);
      res.status(200).json({ message: "User signed up for event successfully" });
    } catch (error) {
      console.error("[ERROR] Error signing up for event:", error);
      res.status(500).json({ error: "Failed to sign up for event" });
    }
  }
);


// Edit (Update) an Event (Admin Only)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  [
    body("title")
      .optional()
      .notEmpty()
      .withMessage("Title cannot be empty if provided"),
    body("date")
      .optional()
      .isISO8601()
      .withMessage("Valid date is required if provided"),
    body("location")
      .optional()
      .notEmpty()
      .withMessage("Location cannot be empty if provided"),
    // imageUrl is optional; add validation if necessary.
  ],
  async (req, res) => {
    console.log("[DEBUG] PUT /api/events/:id called");
    const eventId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("[ERROR] Validation failed:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const event = await Event.findByPk(eventId);
      if (!event) {
        console.error(`[ERROR] Event with ID ${eventId} not found`);
        return res.status(404).json({ error: "Event not found" });
      }
      const { title, date, location, imageUrl } = req.body;
      if (title !== undefined) event.title = title;
      if (date !== undefined) event.date = date;
      if (location !== undefined) event.location = location;
      if (imageUrl !== undefined) event.imageUrl = imageUrl;
      await event.save();
      console.log("[DEBUG] Event updated:", event);
      res.json({ message: "Event updated successfully", event });
    } catch (error) {
      console.error("[ERROR] Event update failed:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  }
);


// ✅ Delete an Event (Admin Only)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    console.log("[DEBUG] DELETE /api/events/:id called");
    const eventId = req.params.id;

    try {
      const event = await Event.findByPk(eventId);
      if (!event) {
        console.error(`[ERROR] Event with ID ${eventId} not found`);
        return res.status(404).json({ error: "Event not found" });
      }

      // If you need ownership checks, do them here.
      await event.destroy();
      console.log(`[DEBUG] Event ${eventId} deleted successfully.`);
      return res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("[ERROR] Failed to delete event:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  }
);

// 
router.get(
  '/signedup',
  authenticateJWT,
  async (req, res) => {
    try {
      const userId = req.user.id;
      // Assuming your SignUp model has a foreign key "UserId" and is associated with the Event model
      const signups = await SignUp.findAll({
        where: { UserId: userId },
        include: [Event],
      });
      // Map the signups to get the event details
      const events = signups.map((signup) => signup.Event);
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching signed-up events:', error);
      res.status(500).json({ error: 'Failed to fetch your events.' });
    }
  }
);

// Cancel registration for an event (for a signed-up user)
router.delete(
  '/signup/:eventId',
  authenticateJWT,
  async (req, res) => {
    const userId = req.user.id;
    const { eventId } = req.params;
    try {
      const signup = await SignUp.findOne({
        where: { UserId: userId, EventId: eventId },
      });
      if (!signup) {
        return res.status(404).json({ error: 'Registration not found for this event.' });
      }
      await signup.destroy();
      res.status(200).json({ message: 'Registration cancelled successfully.' });
    } catch (error) {
      console.error('Error cancelling registration:', error);
      res.status(500).json({ error: 'Failed to cancel registration.' });
    }
  }
);



module.exports = router;
