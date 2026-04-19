import { Request, Response } from 'express';
import Car from '../models/Car';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getCars = asyncHandler(async (req: Request, res: Response) => {
  const cars = await Car.find({ owner: req.params.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: cars });
});

export const createCar = asyncHandler(async (req: Request, res: Response) => {
  const photos = req.files ? (req.files as Express.Multer.File[]).map((f: any) => f.path) : [];
  const car = await Car.create({ ...req.body, owner: req.user!._id, photos });
  res.status(201).json({ success: true, data: car });
});

export const updateCar = asyncHandler(async (req: Request, res: Response) => {
  const car = await Car.findById(req.params.id);
  if (!car) throw ApiError.notFound('Voiture non trouvée');
  if (car.owner.toString() !== String(req.user!._id)) throw ApiError.forbidden('Non autorisé');

  const newPhotos = req.files ? (req.files as Express.Multer.File[]).map((f: any) => f.path) : [];
  if (newPhotos.length > 0) req.body.photos = [...car.photos, ...newPhotos].slice(0, 5);

  const updated = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: updated });
});

export const deleteCar = asyncHandler(async (req: Request, res: Response) => {
  const car = await Car.findById(req.params.id);
  if (!car) throw ApiError.notFound('Voiture non trouvée');
  if (car.owner.toString() !== String(req.user!._id)) throw ApiError.forbidden('Non autorisé');
  await car.deleteOne();
  res.json({ success: true, message: 'Voiture supprimée' });
});
