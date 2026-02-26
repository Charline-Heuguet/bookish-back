import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Auth middleware - Headers:', req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('Auth middleware - Token manquant');
      return res.status(401).json({ error: 'Token manquant' });
    }

    console.log('Auth middleware - Vérification du token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log('Auth middleware - Token valide, userId:', decoded.userId);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log('Auth middleware - Erreur:', error);
    return res.status(401).json({ error: 'Token invalide' });
  }
};