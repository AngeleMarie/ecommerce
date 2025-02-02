import mongoose from "mongoose";

const authInfoSchema = new mongoose.Schema({
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String },
    isConfirmed: { type: Boolean, default: false },
    confirmationToken: { type: String, default: '' },
    googleId: { type: String, unique: true, sparse: true },
    role:{type:String, default:"client"},
    resetCode:{type:String},
    country:{type:String,default:"Rwanda"},
    city:{type:String,default:"Kigali"},
    street:{type:String,default:"KG 655 st"},
    profile:{type:String}
    
});

export default mongoose.model('Authentication', authInfoSchema);