import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validateId from "../utils/validateObjectId";
import {sendMail} from '../utils/sendMail';
import { config } from "dotenv";
config(); 


type DecodedToken = {
    id: string;
};


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




export const handleRefreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).send('Unauthorized');
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as DecodedToken;
        const user = await User.findById(decoded.id);
        
        if (!user || decoded.id !== user.id.toString()) {
            return res.status(401).send('Unauthorized refresh token');
        }

        const accessToken = generateToken(user.id);
        res.json({ accessToken });
    } catch (err) {
        return res.status(401).send('Unauthorized refresh token');
    }
};
export const logout = async (req: Request, res: Response) => {
    try {
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;
        if (!accessToken && !refreshToken) {
            return res.status(401).send('Unauthorized');
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).send('Logged out successfully');
    } catch (err) {
        return res.status(500).send('Server error');
    }
};

export const updatePassword = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).send('User not authenticated');
        }
        const { _id } = req.user;
        const user = await User.findById(_id);
        const password = req.body.password;
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (password) {
            user.password = password;
            await user.save();
            res.status(200).json({ message: 'Password updated successfully', user });
        }
    } catch (err) {
        return res.status(500).send('Server error');
    }
};

export const forgetPasswordToken = async (req: Request, res: Response) => {
    try {
        const { to } = req.body;
        const emailToLower = to.toLowerCase();
        const user = await User.findOne({ email: emailToLower });
        if (!user) {
            return res.status(400).json({ message: 'No user found with this email address' });
        }
        const token = user.createPasswordResetToken();
        await user.save();
        await sendMail({
            from: process.env.EMAIL,
            to: to,
            subject: 'Reset Password',
            text: `Use the following link to reset your password ${process.env.TEST_URL}/reset-password/${token}`
        });
        return res.status(200).json({ message: 'Password reset email sent successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const token = req.params.token;
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).send('Invalid token');
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.json(user);
    } catch (err) {
        return res.status(500).send('Server error');
    }
};

export const getUserWishList = async (req: Request, res: Response) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id).populate('wishlist');
        if (!user) {
            return res.status(404).send('User not found');
        }
        return res.json(user.wishlist);
    } catch (err) {
        return res.status(500).send('Server error');
    }
};

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('User not found');
        }
        const matched = await user.isPasswordMatched(password);
        if (!matched) {
            return res.status(400).send('Invalid credentials');
        }
        if (user.role !== 'admin') {
            return res.status(403).send('User not authorized');
        }
        const accessToken = generateToken(user.id);
        const refreshToken = generateToken(user.id);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 3 });
        res.json({
            message: 'Admin login successful',
            id: user.id,
            token: accessToken,
            refreshToken,
            firstName: user.firstName,
            lastName: user.lastName,
            mobile: user.mobile,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        return res.status(500).send('Server error');
    }
};

export const adminLogout = async (req: Request, res: Response) => {
    try {
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;
        if (!accessToken && !refreshToken) {
            return res.status(401).send('Unauthorized');
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).send('Logged out successfully');
    } catch (err) {
        return res.status(500).send('Server error');
    }
};

