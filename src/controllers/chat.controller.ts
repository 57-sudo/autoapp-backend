import { Request, Response } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await Conversation.find({ participants: req.user!._id })
    .sort({ updatedAt: -1 })
    .populate('participants', 'name avatar');
  res.json({ success: true, data: conversations });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw ApiError.notFound('Conversation non trouvée');

  const isParticipant = conversation.participants.some((p) => p.toString() === req.user!._id.toString());
  if (!isParticipant) throw ApiError.forbidden('Non autorisé');

  const limit = parseInt(req.query.limit as string) || 50;
  const before = req.query.before as string;
  const filter: any = { conversation: req.params.id };
  if (before) filter.createdAt = { $lt: new Date(before) };

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name avatar');

  res.json({ success: true, data: messages.reverse() });
});

export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const { participantId } = req.body;
  const userId = req.user!._id;

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, participantId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({ participants: [userId, participantId] });
  }

  await conversation.populate('participants', 'name avatar');
  res.json({ success: true, data: conversation });
});
