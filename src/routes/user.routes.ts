import { Router } from 'express';
import { getProfile, updateProfile, followUser, unfollowUser } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth';
import { uploadAvatar } from '../middlewares/upload';

const router = Router();

router.get('/:id', getProfile);
router.put('/me', authMiddleware, uploadAvatar, updateProfile);
router.post('/:id/follow', authMiddleware, followUser);
router.delete('/:id/follow', authMiddleware, unfollowUser);

export default router;
