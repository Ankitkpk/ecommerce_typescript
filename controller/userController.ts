import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validateId from "../utils/validateObjectId";
import { config } from "dotenv";
config(); 

const generateToken =(id:string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return jwt.sign({ id }, secret, { expiresIn: "55m" });
};

const refreshTokenGenerator = (id: string): string => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new Error("REFRESH_TOKEN_SECRET environment variable is not defined");
    }
    return jwt.sign({ id }, secret, { expiresIn: "3d" });
  };

export const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, firstName, lastName, mobile } = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with hashed password
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      mobile,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};


export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).send("User not found");
    return;
  }

  const matched = await user.isPasswordMatched(req.body.password);
  if (!matched) {
    res.status(400).send("Invalid credentials");
    return;
  }

  
  const accessToken = generateToken(user.id);
  const refreshToken = refreshTokenGenerator(user.id);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 3, 
  });

  // Send back the user data along with the tokens
  res.json({
    status: "success",
    id: user.id,
    token: accessToken,
    refreshToken: refreshToken,
    firstName: user.firstName,
    lastName: user.lastName,
    mobile: user.mobile,
    email: user.email,
    password: user.password, 
  });
};

const allUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find();
        if (!users || users.length === 0) {
            res.status(404).json({ message: "No users found" });
            return;
        }
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id: string = req.params.id;
      validateId(id);
      
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Server Error" });
    }
  };
  
  export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id: string = req.params.id;
      validateId(id);
      
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Server Error" });
    }
  };
  
  export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id: string = req.params.id;
      validateId(id);
      
      const user = await User.findByIdAndUpdate(id, req.body, { new: true });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Server Error" });
    }
  };