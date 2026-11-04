const express = require("express")
const mongoose = require("mongoose")
const Session = require("../models/Session")
const Skill = require("../models") 
const router = express.Router()

router.post("/", async (req, res) =>{
    try {
        if (!req.user?.id) {
            return res.status(401).json({message: "Authentication required"})
        }
    }
    const { skillId, date, message } = req.body
    
    if (!mongoose.isValidObjectId(skillId)) {
        return res.status(400).json({message: "Invalid skill ID"})
    }

    const skill = await Skill.findby(skillId)

    catch(error){

    }
})