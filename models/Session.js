const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    date: {
      type: Date
    },
    status: {
      type: String
    },
    message: {
      type: String
    },
    requesterID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    providerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    skillID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill"
    },

  },
  { timestamps: true },
);


const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;