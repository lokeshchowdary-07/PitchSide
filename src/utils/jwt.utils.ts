import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export const signToken = (userId: String)=>{
    const token =jwt.sign(userId, JWT_SECRET, {
        expiresIn: '1h'
    });
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
