import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    skillId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Completed", "Cancelled"], 
        default: "Pending"
    }, 
    message: {
        type: String,
        default: "",
        trim: true
    }
}, {timestamps: true})

const Session = mongoose.model("Session", sessionSchema)

export default Session