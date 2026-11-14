const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema ({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true 
    }, 
    title: {
        type: String,
        required: true,
        trim: true
    }, 
    description: {
        type: String,
        required: true, 
        trim: true
    }, 
    category: {
        type: String,
        required: true,
        trim: true
    }, 
    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required: true
    }, 
    type: {
        type: String,
        enum: ["Teach", "Learn"],
        required: true
    },
    availability: [{
        date: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        }
    }]
}, {timestamps: true})

const Skill = mongoose.model("Skill", skillSchema)

module.exports = Skill;