import { Request, Response } from 'express';
import Event from '../models/Event';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, radius } = req.query;
  let filter: any = { date: { $gte: new Date() } };

  if (lat && lng) {
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng as string), parseFloat(lat as string)] },
        $maxDistance: parseInt(radius as string) || 50000,
      },
    };
  }

  const events = await Event.find(filter)
    .sort({ date: 1 })
    .populate('creator', 'name avatar')
    .limit(50);
  res.json({ success: true, data: events });
});

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const image = req.file ? (req.file as any).path : '';
  const event = await Event.create({ ...req.body, creator: req.user!._id, image, participants: [req.user!._id] });
  await event.populate('creator', 'name avatar');
  res.status(201).json({ success: true, data: event });
});

export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id)
    .populate('creator', 'name avatar')
    .populate('participants', 'name avatar');
  if (!event) throw ApiError.notFound('Événement non trouvé');
  res.json({ success: true, data: event });
});

export const joinEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { participants: req.user!._id } },
    { new: true }
  ).populate('participants', 'name avatar');
  if (!event) throw ApiError.notFound('Événement non trouvé');
  res.json({ success: true, data: event });
});

export const leaveEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { $pull: { participants: req.user!._id } },
    { new: true }
  );
  if (!event) throw ApiError.notFound('Événement non trouvé');
  res.json({ success: true, message: 'Participation annulée' });
});
