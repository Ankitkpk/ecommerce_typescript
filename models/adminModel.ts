import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username : {
            type:String,
            required:true,
            unique:true,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password:{
            type:String,
            required:true,
        },
        role:{
            type:String,
            required:true,
            enum:["admin","doctor","patient","receptionist"],
        }
    },
    {
        timestamps:true,
    }
);

const adminModel = mongoose.model("admin", userSchema);

export default adminModel;