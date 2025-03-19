import { Request, Response } from "express";
import { createAdmin , findAdmin } from "../service/admin";
import { comparePassword, hashPassword } from "../middleware/hassedPassword";
import { createToken, verifyToken } from "../middleware/token";
import { isBlocked, trackFailedLogin, resetLoginAttempts } from "../utils/LogginAttemp";
import nodemailer from "nodemailer";

export const signupAdmin = async(req: Request, res: Response): Promise<Response> =>{
    try {
        const {username, email, password, role} = req.body;
        if(!username && !email && !password){
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }
        const hashedPassword = await hashPassword(password) as String;
        if(!hashedPassword){
            return res.status(500).json({
                message: "Internal server error, Error while hashing password"
            })
        }
        const admin = await createAdmin({username, email, hashedPassword, role});
        if(!admin){
            return res.status(500).json({
                message: "Something went wrong"
            })
        }
        return res.status(200).json({
            message: "admin signup successfuly"
        })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}




export const loginAdmin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        if (isBlocked(email)) {
            return res.status(429).json({ message: "Too many failed attempts. Try again later." });
        }

        const admin = await findAdmin({ email });
        if (!admin) {
            trackFailedLogin(email);
            return res.status(404).json({ message: "Admin not found" });
        }

        const passwordMatch = await comparePassword(password, admin.password as string);
        
        if (!passwordMatch) {
            trackFailedLogin(email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        resetLoginAttempts(email);

        const token = createToken({ email, role: admin.role });

       
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
        });

       

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            admin: admin,
        });

    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};



export const forgetPassword = async(req: Request, res: Response): Promise<Response> =>{
    const email = req.body.email;
    try {
      if(!email){
        return res.status(400).json({ message: "Email is required"});
      }
      const user = findAdmin({email});
      if(!user){
        return res.status(400).json({message:"user not found"});
      }
      const token = createToken({email});
      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.COMPANY_MAIL,
          pass: process.env.COMPANY_PASSWORD
        }
      })
      const receiver = {
        from: "E-Sutra Technologies",
        to: email,
        subject: "Password Reset Request",
        text: `Click this link to generate new password ${process.env.CLIENT_URL}/reset-password/${token}`
      }
      await transport.sendMail(receiver);
      return res.status(200).json({message: "Password reset link send Successfuly"})
    } catch (error) {
      console.log(error);
      return res.status(500).json({ messsage:"server error"});
    }
  };
  
  export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        if (!password) {
            return res.status(400).send({ message: "Please provide a password" });
        }

        console.log("Received token:", token);

        const decode = verifyToken(token);
        if (!decode || !decode.email) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const user = await findAdmin({ email: decode.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newHashedPassword: string = await hashPassword(password);
        user.password = newHashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password reset successful" });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};