import { Request, Response } from 'express';
import { ChatGroup, GroupMessage } from '../models/ChatGroup';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getMyGroups = asyncHandler(async (req: Request, res: Response) => {
  const groups = await ChatGroup.find({ members: req.user!._id })
    .populate('members', 'name avatar')
    .populate('admins', 'name avatar')
    .populate('lastMessage')
    .populate('creator', 'name avatar')
    .sort({ updatedAt: -1 });

  res.json({ success: true, data: groups });
});

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, avatar, memberIds } = req.body;

  const allMembers = [...new Set([req.user!._id.toString(), ...(memberIds || [])])];

  const group = await ChatGroup.create({
    name,
    description,
    avatar: avatar || '',
    creator: req.user!._id,
    members: allMembers,
    admins: [req.user!._id],
  });

  await group.populate('members', 'name avatar');
  await group.populate('admins', 'name avatar');
  await group.populate('creator', 'name avatar');

  res.status(201).json({ success: true, data: group });
});

export const getGroupMessages = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const group = await ChatGroup.findOne({
    _id: req.params.groupId,
    members: req.user!._id,
  });
  if (!group) throw ApiError.notFound('Groupe non trouvé');

  const messages = await GroupMessage.find({ group: req.params.groupId })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({ success: true, data: messages.reverse() });
});

export const sendGroupMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content, image } = req.body;

  const group = await ChatGroup.findOne({
    _id: req.params.groupId,
    members: req.user!._id,
  });
  if (!group) throw ApiError.notFound('Groupe non trouvé');

  const message = await GroupMessage.create({
    group: req.params.groupId,
    sender: req.user!._id,
    content,
    image,
    readBy: [req.user!._id],
  });

  group.lastMessage = message._id as any;
  await group.save();

  await message.populate('sender', 'name avatar');
  res.status(201).json({ success: true, data: message });
});

export const addGroupMembers = asyncHandler(async (req: Request, res: Response) => {
  const { userIds } = req.body;

  const group = await ChatGroup.findOneAndUpdate(
    { _id: req.params.groupId, admins: req.user!._id },
    { $addToSet: { members: { $each: userIds } } },
    { new: true }
  );
  if (!group) throw ApiError.notFound('Groupe non trouvé ou non autorisé');

  await group.populate('members', 'name avatar');
  res.json({ success: true, data: group });
});

export const removeGroupMember = asyncHandler(async (req: Request, res: Response) => {
  const group = await ChatGroup.findOneAndUpdate(
    { _id: req.params.groupId, admins: req.user!._id },
    { $pull: { members: req.params.userId, admins: req.params.userId } },
    { new: true }
  );
  if (!group) throw ApiError.notFound('Groupe non trouvé ou non autorisé');

  res.json({ success: true, data: group });
});

export const leaveGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await ChatGroup.findOneAndUpdate(
    { _id: req.params.groupId, members: req.user!._id },
    { $pull: { members: req.user!._id, admins: req.user!._id } },
    { new: true }
  );
  if (!group) throw ApiError.notFound('Groupe non trouvé');

  if (group.members.length === 0) {
    await ChatGroup.findByIdAndDelete(req.params.groupId);
    await GroupMessage.deleteMany({ group: req.params.groupId });
  }

  res.json({ success: true, message: 'Vous avez quitté le groupe' });
});

export const deleteGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await ChatGroup.findOneAndDelete({
    _id: req.params.groupId,
    creator: req.user!._id,
  });
  if (!group) throw ApiError.notFound('Groupe non trouvé ou non autorisé');

  await GroupMessage.deleteMany({ group: req.params.groupId });
  res.json({ success: true, message: 'Groupe supprimé' });
});
