import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/token';
import User from '../models/User';
import { ApiError } from '../utils/ApiError';

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Token manquant');
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) throw ApiError.unauthorized('Utilisateur non trouvé');
    req.user = user as any;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : ApiError.unauthorized('Token invalide'));
  }
};
