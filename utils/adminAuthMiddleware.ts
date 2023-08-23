import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type Env = {
  JWT_USER_KEY: string;
};

const secret = process.env["JWT_Admin_KEY" as keyof Env] || "iamaloyaladmin"; // Replace with your own secret key

export function authenticateAdminToken(req: Request, res: Response<any, Record<string, any>>, next: NextFunction): Response<any, Record<string, any>> | void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
     res.status(401).json({ message: "Unauthorized" });
     return;
  }

  jwt.verify(token, secret, (err: any) => {
    if (err) {
       res.status(403).json({ message: "Unauthorized" });
       return;
    }
    next();
  });
}
