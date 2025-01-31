// backend/src/routes/event.js

const express = require("express");
const { Event, User } = require("../models");
const { body, validationResult } = require("express-validator");
const { authenticateJWT, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a New Event (Admin Only)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  [
    body("title").notEmpty().withMessage("Title is required."),
    body("date").isISO8601().withMessage("Valid date is required."),
    body("location").notEmpty().withMessage("Location is required."),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, date, location } = req.body;

      const newEvent = await Event.create({ title, date, location });

      res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (error) {
      next(error);
    }
  }
);

// Fetch All Events
router.get("/", async (req, res, next) => {
  try {
    const events = await Event.findAll({
      include: [{ model: User, as: "Users", through: { attributes: [] } }],
    });

    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
});

// Sign Up for an Event
router.post(
  "/:eventId/signup",
  authenticateJWT,
  authorizeRoles("user", "admin"),
  async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      // Check if event exists
      const event = await Event.findByPk(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Check if user already signed up
      const existingSignUp = await event.hasUser(userId);
      if (existingSignUp) {
        return res.status(400).json({ error: "User already signed up for this event" });
      }

      // Sign up user for the event
      await event.addUser(userId);

      res.status(200).json({ message: "User signed up for the event successfully" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
