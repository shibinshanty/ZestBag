const Notification = require("../models/NotificationModel");

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const { recipientType, userId } = req.query;

    if (!recipientType) {
      return res.status(400).json({
        success: false,
        message: "recipientType is required",
      });
    }

    if (!["user", "admin"].includes(recipientType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipientType",
      });
    }

    const filter = {
      recipientType,
    };

    if (userId) {
      filter.userId = userId;
    }

    const notifications = await Notification.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications",
    });
  }
};

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const {
      recipientType,
      userId,
      type,
      title,
      message,
      orderId,
    } = req.body;

    if (!recipientType || !userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message:
          "recipientType, userId, type, title and message are required",
      });
    }

    if (!["user", "admin"].includes(recipientType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipientType",
      });
    }

    const notification = await Notification.create({
      recipientType,
      userId,
      type,
      title,
      message,
      orderId: orderId || null,
    });

    return res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};