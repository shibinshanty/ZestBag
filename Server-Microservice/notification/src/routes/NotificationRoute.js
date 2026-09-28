const express = require("express");

const {
  getNotifications,
  createNotification,
  markAsRead,
} = require("../controller/NotificationController");

const router = express.Router();

// Get notifications
router.get("/", getNotifications);

// Create notification
// Temporary/internal testing endpoint.
// Later RabbitMQ will handle notification creation.
router.post("/", createNotification);

// Mark notification as read
router.put("/:id/read", markAsRead);

module.exports = router;