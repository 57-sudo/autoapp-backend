import { Router } from 'express';
import { getCars, createCar, updateCar, deleteCar } from '../controllers/garage.controller';
import { authMiddleware } from '../middlewares/auth';
import { uploadCarPhotos } from '../middlewares/upload';

const router = Router();

router.get('/users/:userId/cars', getCars);
router.post('/cars', authMiddleware, uploadCarPhotos, createCar);
router.put('/cars/:id', authMiddleware, uploadCarPhotos, updateCar);
router.delete('/cars/:id', authMiddleware, deleteCar);

export default router;
