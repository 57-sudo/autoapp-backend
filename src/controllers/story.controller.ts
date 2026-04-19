import { Request, Response } from 'express';
import Story from '../models/Story';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getStories = asyncHandler(async (req: Request, res: Response) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const stories = await Story.find({ expiresAt: { $gt: new Date() } })
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 });

  const groupedStories = stories.reduce((acc: any, story: any) => {
    const authorId = story.author._id.toString();
    if (!acc[authorId]) {
      acc[authorId] = {
        author: story.author,
        stories: [],
        hasUnseen: false,
      };
    }
    acc[authorId].stories.push({
      ...story.toObject(),
      seen: story.views.some((v: any) => v.toString() === req.user!._id.toString()),
    });
    if (!story.views.includes(req.user!._id)) {
      acc[authorId].hasUnseen = true;
    }
    return acc;
  }, {});

  res.json({ success: true, data: Object.values(groupedStories) });
});

export const createStory = asyncHandler(async (req: Request, res: Response) => {
  const { image, caption } = req.body;

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const story = await Story.create({
    author: req.user!._id,
    image,
    caption,
    expiresAt,
    views: [],
  });

  await story.populate('author', 'name avatar');
  res.status(201).json({ success: true, data: story });
});

export const viewStory = asyncHandler(async (req: Request, res: Response) => {
  const story = await Story.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { views: req.user!._id } },
    { new: true }
  );
  if (!story) throw ApiError.notFound('Story non trouvée');
  res.json({ success: true, data: story });
});

export const deleteStory = asyncHandler(async (req: Request, res: Response) => {
  const story = await Story.findOneAndDelete({
    _id: req.params.id,
    author: req.user!._id,
  });
  if (!story) throw ApiError.notFound('Story non trouvée');
  res.json({ success: true, message: 'Story supprimée' });
});

export const getMyStories = asyncHandler(async (req: Request, res: Response) => {
  const stories = await Story.find({
    author: req.user!._id,
    expiresAt: { $gt: new Date() },
  })
    .populate('views', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: stories });
});
