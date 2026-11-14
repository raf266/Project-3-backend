const router = require("express").Router();
const mongoose = require("mongoose");
const Skill = require("../models/Skill");
const verifyToken = require("../middleware/verifyToken");


router.get("/", async (req,res)=>{
    try{
        const skills = await Skill.find()
        .populate("userId","name profileImage");

        res.status(200).json(skills);
    }catch (error){
        res.status(500).json({
            message: "Error fetching skills"
        });
    }
});



router.get("/:id", async (req,res)=>{
    try{
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({
                message: "Invalid skill ID"
            });
        }


        const skill = await Skill.findById(req.params.id)
        .populate("userId","name email profileImage");

        if(!skill){
            return res.status(404).json({
                message: "Skill not found"
            });
        }

        res.status(200).json(skill);
    }catch (error){
        res.status(500).json({
            message: "Error fetching skill"
        });
    }
});



router.post("/", verifyToken, async (req,res)=>{
    try{
        const {title, description, category, level, type} = req.body;

        const skill = await Skill.create({
            userId: req.user._id,
            title,
            description,
            category,
            level,
            type

        });

        res.status(201).json(skill);
    }catch (error){
        res.status(400).json({
            message: "Error creating skill",
            error: error.message
        });
    }
});



router.put("/:id",verifyToken, async (req,res)=>{
    try{
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({
                message: "Invalid skill ID"
            });
        }


        const skill = await Skill.findById(req.params.id);

        if(!skill){
            return res.status(404).json({
                message: "Skill not found"
            });
        }

        if(skill.userId.toString() !== req.user._id.toString()){
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        const {title, description, category, level, type} = req.body;

        const updatedSkill = await Skill.findByIdAndUpdate(
            req.params.id,
            {title,description,category,level,type},
            {new:true , runValidators:true}
        );

        res.status(200).json(updatedSkill);
    }catch (error){
        res.status(400).json({
            message: "Error updating skill",
            error: error.message
        });
    }
});



router.delete("/:id",verifyToken, async (req,res)=>{
    try{
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({
                message: "Invalid skill ID"
            });
        }


        const skill = await Skill.findById(req.params.id);

        if(!skill){
            return res.status(404).json({
                message: "Skill not found"
            });
        }

        if(skill.userId.toString() !== req.user._id.toString()){
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        await Skill.findByIdAndDelete(req.params.id);


        res.status(200).json({
            message: "Skill deleted successfully"
        });
    }catch (error){
        res.status(500).json({
            message: "Error deleting skill"
        });
    }
});


router.put("/:id/availability", verifyToken, async (req,res)=>{
    try{
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({message:"Invalid skill ID"});
        }

        const skill = await Skill.findById(req.params.id);

        if(!skill){
            return res.status(404).json({message:"Skill not found"});
        }

        if(skill.userId.toString() !== req.user._id.toString()){
            return res.status(403).json({message:"Not authorized"});
        }

        if(skill.type !== "Teach"){
            return res.status(400).json({message:"Availability can only be added to teaching skills"});
        }

        const {availability} = req.body;

        if(!Array.isArray(availability)){
            return res.status(400).json({message:"Availability must be an array"});
        }

        for(const slot of availability){
            const start = new Date(`${slot.date}T${slot.startTime}`);
            const end = new Date(`${slot.date}T${slot.endTime}`);

            if(!slot.date || !slot.startTime || !slot.endTime ||
               Number.isNaN(start.getTime()) ||
               Number.isNaN(end.getTime()) ||
               start <= new Date() ||
               end <= start){
                return res.status(400).json({message:"Please provide valid future availability times"});
            }
        }

        skill.availability = availability.map(slot=>({
            date:new Date(`${slot.date}T00:00:00`),
            startTime:slot.startTime,
            endTime:slot.endTime
        }));

        await skill.save();

        res.status(200).json({
            message:"Availability updated successfully",
            availability:skill.availability
        });
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Error updating availability"});
    }
});


module.exports = router;