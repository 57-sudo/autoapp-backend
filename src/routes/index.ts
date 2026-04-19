import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import garageRoutes from './garage.routes';
import postRoutes from './post.routes';
import chatRoutes from './chat.routes';
import eventRoutes from './event.routes';
import listingRoutes from './listing.routes';
import notificationRoutes from './notification.routes';
import storyRoutes from './story.routes';
import chatGroupRoutes from './chatGroup.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/garage', garageRoutes);
router.use('/posts', postRoutes);
router.use('/chat', chatRoutes);
router.use('/events', eventRoutes);
router.use('/listings', listingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stories', storyRoutes);
router.use('/groups', chatGroupRoutes);

export default router;
