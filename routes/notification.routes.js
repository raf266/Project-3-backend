
const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.use(verifyToken);

// GET MY NOTIFICATIONS
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user._id,
    })
      .populate("senderId", "name username profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// MARK ONE NOTIFICATION AS READ
router.patch("/:id/read", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientId: req.user._id,
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating notification" });
  }
});

// MARK ALL NOTIFICATIONS AS READ
router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipientId: req.user._id,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating notifications" });
  }
});

module.exports = router;
