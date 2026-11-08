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

module.exports = router;