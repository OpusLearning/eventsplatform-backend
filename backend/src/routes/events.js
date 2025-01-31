/**
 * routes/events.js
 *
 * Provides a complete set of routes for managing events:
 * - GET   /api/events          : Fetch all events (public)
 * - POST  /api/events          : Create a new event (admin only)
 * - POST  /api/events/signup   : Sign up a user for an event
 * - PUT   /api/events/:id      : Edit (update) an existing event (admin only)
 * - DELETE /api/events/:id     : Remove an event from the local DB (admin only)
 */

const express = require("express");
const { Event, User, SignUp } = require("../models");
const { body, validationResult } = require("express-validator");
const { authenticateJWT } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authorize.js");

const router = express.Router();

console.log("[DEBUG] events.js is loaded");

// ✅ Health Check Route
router.get("/health", (req, res) => {
  res.status(200).json({ message: "Events API is running" });
});

// ✅ Fetch All Events (Public)
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

// ✅ Create a New Event (Admin Only)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("location").notEmpty().withMessage("Location is required"),
  ],
  async (req, res) => {
    console.log("[DEBUG] POST /api/events called");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("[ERROR] Validation failed:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, date, location } = req.body;
      console.log(`[DEBUG] Creating Event: ${title} on ${date} at ${location}`);

      const newEvent = await Event.create({ title, date, location });
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

// ✅ Sign Up a User for an Event
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

// ✅ Edit (Update) an Event (Admin Only)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  [
    // Only validate if fields are provided
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

      // Update only the provided fields
      const { title, date, location } = req.body;
      if (title !== undefined) event.title = title;
      if (date !== undefined) event.date = date;
      if (location !== undefined) event.location = location;

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

module.exports = router;
