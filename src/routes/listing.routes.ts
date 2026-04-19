import { Router } from 'express';
import { getListings, createListing, getListing, updateListing, deleteListing } from '../controllers/listing.controller';
import { authMiddleware } from '../middlewares/auth';
import { uploadListingImages } from '../middlewares/upload';

const router = Router();

router.get('/', getListings);
router.post('/', authMiddleware, uploadListingImages, createListing);
router.get('/:id', getListing);
router.put('/:id', authMiddleware, uploadListingImages, updateListing);
router.delete('/:id', authMiddleware, deleteListing);

export default router;
