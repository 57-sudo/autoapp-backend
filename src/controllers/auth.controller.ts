import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../services/token';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { config } from '../config/env';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.badRequest('Email déjà utilisé');

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });

  const accessToken = generateAccessToken(String(user._id));
  const refreshToken = generateRefreshToken(String(user._id));

  res.status(201).json({
    success: true,
    data: { user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar }, accessToken, refreshToken },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) throw ApiError.unauthorized('Identifiants invalides');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw ApiError.unauthorized('Identifiants invalides');

  const accessToken = generateAccessToken(String(user._id));
  const refreshToken = generateRefreshToken(String(user._id));

  res.json({
    success: true,
    data: { user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar }, accessToken, refreshToken },
  });
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;
  // Verify Google idToken
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!response.ok) throw ApiError.unauthorized('Token Google invalide');
  const payload: any = await response.json();

  if (payload.aud !== config.googleClientId) throw ApiError.unauthorized('Client ID Google invalide');

  let user = await User.findOne({ 'oauthProviders.provider': 'google', 'oauthProviders.providerId': payload.sub });

  if (!user) {
    user = await User.findOne({ email: payload.email });
    if (user) {
      user.oauthProviders.push({ provider: 'google', providerId: payload.sub });
      await user.save();
    } else {
      user = await User.create({
        name: payload.name || payload.email,
        email: payload.email,
        avatar: payload.picture || '',
        oauthProviders: [{ provider: 'google', providerId: payload.sub }],
      });
    }
  }

  const accessToken = generateAccessToken(String(user._id));
  const refreshToken = generateRefreshToken(String(user._id));

  res.json({
    success: true,
    data: { user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar }, accessToken, refreshToken },
  });
});

export const appleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { identityToken, fullName, email } = req.body;
  // In production, verify Apple identityToken with apple-signin-auth
  // For now, decode the JWT payload
  const parts = identityToken.split('.');
  const payload: any = JSON.parse(Buffer.from(parts[1], 'base64').toString());

  let user = await User.findOne({ 'oauthProviders.provider': 'apple', 'oauthProviders.providerId': payload.sub });

  if (!user) {
    const userEmail = email || payload.email;
    user = await User.findOne({ email: userEmail });
    if (user) {
      user.oauthProviders.push({ provider: 'apple', providerId: payload.sub });
      await user.save();
    } else {
      user = await User.create({
        name: fullName || userEmail,
        email: userEmail,
        oauthProviders: [{ provider: 'apple', providerId: payload.sub }],
      });
    }
  }

  const accessToken = generateAccessToken(String(user._id));
  const refreshToken = generateRefreshToken(String(user._id));

  res.json({
    success: true,
    data: { user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar }, accessToken, refreshToken },
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: req.user });
});
