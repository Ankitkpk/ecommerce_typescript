import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";



const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
}



export const Login = async (req: Request, res: Response):Promise<any> => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

  
    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" });
    }
    const isMatch = await user.isPasswordMatched(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, secret , {
      expiresIn: '1d',
    });

    
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { firstName, lastName, email, mobile, password } = req.body;

    // Check if all required fields are present
    if (!firstName || !lastName || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      mobile,
      password,
    });

    await newUser.save();

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server error: JWT secret not found" });
    }

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, secret, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};







export default Login;
