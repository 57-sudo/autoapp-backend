import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: req.user!._id })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user!._id,
    read: false,
  });

  res.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: { page, limit, total: await Notification.countDocuments({ recipient: req.user!._id }) },
  });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user!._id },
    { read: true },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification non trouvée');
  res.json({ success: true, data: notification });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany(
    { recipient: req.user!._id, read: false },
    { read: true }
  );
  res.json({ success: true, message: 'Toutes les notifications sont marquées comme lues' });
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user!._id,
  });
  if (!notification) throw ApiError.notFound('Notification non trouvée');
  res.json({ success: true, message: 'Notification supprimée' });
});

export const createNotification = async (data: {
  recipient: string;
  sender: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'event' | 'mention';
  title: string;
  body: string;
  data?: any;
}) => {
  return await Notification.create(data);
};
