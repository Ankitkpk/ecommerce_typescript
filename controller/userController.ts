import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

/**
 * @desc Register a new user
 * @route POST /api/users/register
 * @access Public
 */
export const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, lastname, email, password, admin } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user (password will be hashed in the pre-save middleware)
  const newUser = await User.create({
    username,
    lastname,
    email,
    password,
    admin: admin || false,
  });

  if (!newUser) {
    res.status(500);
    throw new Error("User registration failed");
  }

  // Generate JWT Token
  const token = jwt.sign(
    { id: newUser._id, admin: newUser.admin },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  res.status(201).json({
    message: "User registered successfully",
    token,
    user: {
      id: newUser._id,
      username: newUser.username,
      lastname: newUser.lastname,
      email: newUser.email,
      admin: newUser.admin,
    },
  });
});

/**
 * @desc Login user & get token
 * @route POST /api/users/login
 * @access Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  // Generate JWT Token
  const token = jwt.sign(
    { id: user._id, admin: user.admin },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      username: user.username,
      lastname: user.lastname,
      email: user.email,
      admin: user.admin,
    },
  });
});

/**
 * @desc Get user by ID
 * @route GET /api/users/:id
 * @access Private (Admin or User)
 */
export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    message: "User retrieved successfully",
    user: {
      id: user._id,
      username: user.username,
      lastname: user.lastname,
      email: user.email,
      admin: user.admin,
    },
  });
});

/**
 * @desc Delete user by ID
 * @route DELETE /api/users/:id
 * @access Private (Admin only)
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();

  res.status(200).json({ message: "User deleted successfully" });
});

/**
 * @desc Update user details
 * @route PUT /api/users/:id
 * @access Private (Admin or User)
 */
export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { username, lastname, email, admin } = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (username) user.username = username;
  if (lastname) user.lastname = lastname;
  if (email) user.email = email;
  if (admin !== undefined) user.admin = admin;

  await user.save();

  res.status(200).json({
    message: "User updated successfully",
    user: {
      id: user._id,
      username: user.username,
      lastname: user.lastname,
      email: user.email,
      admin: user.admin,
    },
  });
});
