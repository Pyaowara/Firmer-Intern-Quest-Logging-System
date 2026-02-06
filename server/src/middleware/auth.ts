import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    level: string;
  };
}

const JWT_SECRET = "firmer-intern-quest-logging-secret-key";

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({ message: "No token, authorization denied" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      level: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.level !== "admin") {
    res.status(403).json({ message: "Access denied. Admin only." });
    return;
  }
  next();
};
