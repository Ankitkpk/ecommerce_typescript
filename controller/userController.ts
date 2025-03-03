import { Request, Response } from "express";
import User from "../models/userModel";
import Role from "../models/RoleModel"; // Import Role Model
import jwt from "jsonwebtoken";

export const  registerUser=(async (req: Request, res: Response) => {
  try {
    const { username, email, password, roleName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

  
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const newUser = new User({
      username,
      email,
      password,
      role: role._id, 
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: role.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: newUser._id, username: newUser.username, role: role.name },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




