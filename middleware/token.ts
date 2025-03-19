import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const jwt_key = process.env.JWT_SECRET as string;

interface CustomJwtPayload extends JwtPayload {
    email: string
}

export function createToken(payload: object) {
    return jwt.sign(payload, jwt_key, {expiresIn: "15m"});    
}

export function verifyToken (token: string){
    return jwt.verify(token, jwt_key) as CustomJwtPayload;
}