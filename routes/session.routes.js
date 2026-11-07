const express = require("express");
const mongoose = require("mongoose");
const Session = require("../models/Session");
const Skill = require("../models/Skill");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({message: "Authentication required"});
    }

    const { skillId, date, message } = req.body;

    if (!mongoose.isValidObjectId(skillId)) {
      return res.status(400).json({message: "Invalid skill ID"});
    }

    const skill = await Skill.findById(skillId);

    if (!skill) {
      return res.status(404).json({message: "Skill not found"});
    }

    if (skill.type !== "Teach") {
      return res.status(400).json({message: "Only teaching skills can be requested"});
    }

    const requesterId = req.user.id;
    const providerId = skill.userId;

    if (requesterId.toString() === providerId.toString()) {
      return res.status(400).json({message: "You cannot request your own skill"});
    }

    const sessionDate = new Date(date);

    if (!date || Number.isNaN(sessionDate.getTime()) || sessionDate <= new Date()) {
      return res.status(400).json({message: "Please provide a valid future date"});
    }

    const session = await Session.create({
    requesterId, providerId, skillId, date: sessionDate, message, status: "Pending"
    });

    res.status(201).json({ message: "Session created successfully", session
    });

  } catch (error) {
    res.status(500).json({message: "Error creating session"});
  }
});

router.get("/my", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required"});
    }

    const sessions = await Session.find({
      $or: [
        { requesterId: req.user.id },
        { providerId: req.user.id }
      ]
    })
      .populate("requesterId", "name email")
      .populate("providerId", "name email")
      .populate("skillId", "title category");

    res.status(200).json(sessions);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching sessions"
    });
  }
});

router.patch("/:id/accept", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required"});
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID"});
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found"});
    }

    if (session.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the provider can accept sessions"});
    }

    if (session.status !== "Pending") {
      return res.status(400).json({ message: "Only pending sessions can be accepted"});
    }

    session.status = "Accepted";
    await session.save();

    res.status(200).json({ message: "Session accepted successfully", session});

  } catch (error) {
    res.status(500).json({ message: "Error accepting session"});
  }
});


router.patch("/:id/reject", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required"});
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID"});
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({message: "Session not found"});
    }

    if (session.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({message: "Only the provider can reject sessions"});
    }

    if (session.status !== "Pending") {
      return res.status(400).json({ message: "Only pending sessions can be rejected"});
    }

    session.status = "Rejected";
    await session.save();

    res.status(200).json({ message: "Session rejected successfully", session});

  } catch (error) {
    res.status(500).json({ message: "Error rejecting session"});
  }
});


router.patch("/:id/cancel", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required"});
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID"});
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found"});
    }

    const userId = req.user.id.toString();

    if (
      session.requesterId.toString() !== userId &&
      session.providerId.toString() !== userId
    ) {
      return res.status(403).json({ message: "Not authorized"});
    }

    if (!["Pending", "Accepted"].includes(session.status)) {
      return res.status(400).json({ message: "This session cannot be cancelled"});
    }

    session.status = "Cancelled";
    await session.save();

    res.status(200).json({ message: "Session cancelled successfully", session});

  } catch (error) {
    res.status(500).json({message: "Error cancelling session"});
  }
});


router.patch("/:id/complete", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required"});
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID"});
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found"});
    }

    if (session.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the provider can complete sessions"});
    }

    if (session.status !== "Accepted") {
      return res.status(400).json({ message: "Only accepted sessions can be completed"});
    }

    session.status = "Completed";
    await session.save();

    res.status(200).json({ message: "Session completed successfully", session});

  } catch (error) {
    res.status(500).json({ message: "Error completing session"});
  }
});

module.exports = router;
