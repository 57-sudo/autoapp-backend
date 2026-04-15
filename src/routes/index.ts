import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import garageRoutes from './garage.routes';
import postRoutes from './post.routes';
import chatRoutes from './chat.routes';
import eventRoutes from './event.routes';
import listingRoutes from './listing.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/garage', garageRoutes);
router.use('/posts', postRoutes);
router.use('/chat', chatRoutes);
router.use('/events', eventRoutes);
router.use('/listings', listingRoutes);

export default router;
