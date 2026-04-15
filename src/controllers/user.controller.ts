import { Request, Response } from 'express';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw ApiError.notFound('Utilisateur non trouvé');
  res.json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, bio } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { name, bio },
    { new: true, runValidators: true }
  ).select('-password');
  res.json({ success: true, data: user });
});

export const followUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const targetId = req.params.id;
  if (userId.toString() === targetId) throw ApiError.badRequest('Impossible de se suivre soi-même');

  const target = await User.findById(targetId);
  if (!target) throw ApiError.notFound('Utilisateur non trouvé');

  await User.findByIdAndUpdate(userId, { $addToSet: { following: targetId } });
  await User.findByIdAndUpdate(targetId, { $addToSet: { followers: userId } });

  res.json({ success: true, message: 'Utilisateur suivi' });
});

export const unfollowUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const targetId = req.params.id;

  await User.findByIdAndUpdate(userId, { $pull: { following: targetId } });
  await User.findByIdAndUpdate(targetId, { $pull: { followers: userId } });

  res.json({ success: true, message: 'Utilisateur non suivi' });
});
