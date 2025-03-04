import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

interface DecodedToken {
    id: string;
}


declare global {
    namespace Express{
        interface Request {
            user:any;
        }
    }
  }

export const authMiddleware = async (req:Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization?.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
                const authenticatedUser = await User.findById(decoded.id);
                if (!authenticatedUser) {
                    return res.status(401).json({ message: 'Invalid token' });
                }
                req.user = authenticatedUser;
                next();
            } catch (error) {
                return res.status(401).json({ message: 'Invalid token' });
            }
        } else {
            return res.status(401).json({ message: 'Token not found' });
        }
    } else {
        return res.status(401).json({ message: 'Token not found' });
    }
};

/* check if the user is an admin */
export const isAdmin = async (req:Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access only' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const blockUser = async (req:Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isBlocked = true;
        await user.save();
        res.json({ message: 'User blocked' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const unblockUser = async (req:Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isBlocked = false;
        await user.save();
        res.json({ message: 'User unblocked' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};
