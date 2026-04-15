import { Request, Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { parseCursor, buildPagination } from '../utils/pagination';

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const cursor = req.query.cursor as string;
  const cursorFilter = parseCursor(cursor);

  const user = await User.findById(req.user!._id);
  const following = user?.following || [];

  const posts = await Post.find({
    author: { $in: [...following, req.user!._id] },
    ...cursorFilter,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'name avatar')
    .populate('comments.author', 'name avatar');

  const pagination = buildPagination(posts, limit);
  res.json({ success: true, data: posts, pagination });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const images = req.files ? (req.files as Express.Multer.File[]).map((f: any) => f.path) : [];
  const post = await Post.create({ ...req.body, author: req.user!._id, images });
  await post.populate('author', 'name avatar');
  res.status(201).json({ success: true, data: post });
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name avatar')
    .populate('comments.author', 'name avatar');
  if (!post) throw ApiError.notFound('Post non trouvé');
  res.json({ success: true, data: post });
});

export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post non trouvé');

  const userId = req.user!._id;
  const isLiked = post.likes.some((id) => id.toString() === userId.toString());

  if (isLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    post.likes.push(userId as any);
  }
  await post.save();
  res.json({ success: true, data: { likesCount: post.likes.length, isLiked: !isLiked } });
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post non trouvé');

  post.comments.push({ author: req.user!._id as any, content: req.body.content, createdAt: new Date() });
  await post.save();
  await post.populate('comments.author', 'name avatar');
  res.status(201).json({ success: true, data: post.comments });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post non trouvé');
  if (post.author.toString() !== req.user!._id.toString()) throw ApiError.forbidden('Non autorisé');
  await post.deleteOne();
  res.json({ success: true, message: 'Post supprimé' });
});
