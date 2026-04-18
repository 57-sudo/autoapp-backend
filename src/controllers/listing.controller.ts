import { Request, Response } from 'express';
import Listing from '../models/Listing';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { parseCursor, buildPagination } from '../utils/pagination';

export const getListings = asyncHandler(async (req: Request, res: Response) => {
  const { category, condition, minPrice, maxPrice, search, cursor } = req.query;
  const limit = parseInt(req.query.limit as string) || 20;
  const filter: any = { status: 'active', ...parseCursor(cursor as string) };

  if (category) filter.category = category;
  if (condition) filter.condition = condition;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
  }
  if (search) filter.$text = { $search: search as string };

  const listings = await Listing.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('seller', 'name avatar');

  const pagination = buildPagination(listings, limit);
  res.json({ success: true, data: listings, pagination });
});

export const createListing = asyncHandler(async (req: Request, res: Response) => {
  // Gérer les fichiers uploadés (Multer) OU les URLs Cloudinary envoyées dans le body
  let images: string[] = [];
  
  if (req.files && (req.files as Express.Multer.File[]).length > 0) {
    // Cas 1: Fichiers uploadés via Multer
    images = (req.files as Express.Multer.File[]).map((f: any) => f.path);
  } else if (req.body.images && Array.isArray(req.body.images)) {
    // Cas 2: URLs Cloudinary envoyées depuis le frontend
    images = req.body.images;
  }
  
  const listing = await Listing.create({ 
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    condition: req.body.condition,
    seller: req.user!._id, 
    images 
  });
  res.status(201).json({ success: true, data: listing });
});

export const getListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await Listing.findById(req.params.id).populate('seller', 'name avatar');
  if (!listing) throw ApiError.notFound('Annonce non trouvée');
  res.json({ success: true, data: listing });
});

export const updateListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw ApiError.notFound('Annonce non trouvée');
  if (listing.seller.toString() !== String(req.user!._id)) throw ApiError.forbidden('Non autorisé');

  const newImages = req.files ? (req.files as Express.Multer.File[]).map((f: any) => f.path) : [];
  if (newImages.length > 0) req.body.images = [...listing.images, ...newImages].slice(0, 6);

  const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: updated });
});

export const deleteListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw ApiError.notFound('Annonce non trouvée');
  if (listing.seller.toString() !== String(req.user!._id)) throw ApiError.forbidden('Non autorisé');
  await listing.deleteOne();
  res.json({ success: true, message: 'Annonce supprimée' });
});
