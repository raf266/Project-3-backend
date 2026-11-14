
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);

// Get all conversations for the logged-in user
router.get("/conversations", async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId },
        { receiverId: currentUserId },
      ],
    }).sort({ createdAt: -1 }).lean();

    const conversationsMap = new Map();

    messages.forEach((message) => {
      const senderId = message.senderId.toString();
      const receiverId = message.receiverId.toString();

      const otherUserId =
        senderId === currentUserId ? receiverId : senderId;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          latestMessage: message,
          unreadCount: 0,
        });
      }

      if (receiverId === currentUserId && !message.isRead) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    const userIds = [...conversationsMap.keys()];

    const users = await User.find({
      _id: { $in: userIds },
    }).select("name username profileImage").lean();

    const conversations = [...conversationsMap.values()].map(
      (conversation) => ({
        ...conversation,
        user: users.find(
          (user) => user._id.toString() === conversation.userId
        ),
      })
    );

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages between the logged-in user and another student
router.get("/:userId", async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    if (!mongoose.isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    if (otherUserId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot message yourself." });
    }

    const otherUser = await User.findById(otherUserId);

    if (!otherUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message to another student
router.post("/:userId", async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    if (otherUserId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot message yourself." });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({ message: "Message is too long." });
    }

    const otherUser = await User.findById(otherUserId);

    if (!otherUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const message = await Message.create({
      senderId: req.user._id,
      receiverId: otherUserId,
      content: content.trim(),
    });
// CREATE MESSAGE NOTIFICATION
try {
  await Notification.create({
    recipientId: otherUserId,
    senderId: req.user._id,
    type: "new_message",
    message: "You received a new message.",
    relatedId: message._id,
  });
} catch (notificationError) {
  console.error("Failed to create message notification:", notificationError);
}
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages from another student as read
router.patch("/:userId/read", async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    if (!mongoose.isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: req.user._id,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "Messages marked as read." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
