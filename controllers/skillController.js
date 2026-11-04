import Skill from "../models/Skill";

export const getAllSkills = async (req, res)=> {
    try {
        const skills = await Skill.find().populate(
            "userId",
            "name email"
        )
        res.status(200).json(skills)
    }
    catch(err){
        res.status(500).json({
            message: "Error fetching skills",
            error: error.message
        });
    }
}

export const getSkillbyId = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id).populate("userId", "name email profileImage")

        if(!skill){
            return res.status(404).json({message:"Skill not found"})
        }
        res.status(200).json(skill)
    }
    catch(error) {
        if(error.name === "CastError"){
            return res.status(400).json({message: "Invalid skill ID"})
        }
    res.status(500).json({message: "Error fetching skill", error: error.message})
    }
}