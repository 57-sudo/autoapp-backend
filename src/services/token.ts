import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtRefreshSecret, { expiresIn: '30d' });
};

export const verifyToken = (token: string, secret?: string): { userId: string } => {
  return jwt.verify(token, secret || config.jwtSecret) as { userId: string };
};
