import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type Env = {
    JWT_USER_KEY: string;
}
const secret = process.env["JWT_USER_KEY" as keyof Env] || "iamaloyaluser"; // Replace with your own secret key

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({message:"Unauhorized"});
    return;
  }

  jwt.verify(token, secret, (err: any) => {
    if (err) {
      res.status(403).json({message:"Unauhorized"});
      return;
    }
    next();
  });
}
