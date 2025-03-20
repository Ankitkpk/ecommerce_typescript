import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express{
        interface Request {
            id: string;
        }
    }

}

export const AuthenticatedUser = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }
        
        const decode = jwt.verify(token, process.env.SECRET_KEY!) as jwt.JwtPayload;
      
        if (!decode) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            })
        }
        //adding it to request //
        req.id = decode.userId;
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}


export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY!) as jwt.JwtPayload;

        if (!decode) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        const role = decode.role;
        console.log(role);
        // Check if the user has the admin role
        if (role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied: Admins only",
            });
        }

      //  req.id = decode.userId;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};