import Joi from "joi"


const authSchema = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    role:Joi.string(),
    googleId:Joi.string(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])')).required(),
    resetCode:Joi.string(),
});

export default   authSchema