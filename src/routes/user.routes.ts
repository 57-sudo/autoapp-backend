import { Router } from 'express';
import { getProfile, updateProfile, followUser, unfollowUser, searchUsers } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth';
import { uploadAvatar } from '../middlewares/upload';

const router = Router();

router.get('/search', authMiddleware, searchUsers);
router.get('/:id', getProfile);
router.put('/me', authMiddleware, uploadAvatar, updateProfile);
router.post('/:id/follow', authMiddleware, followUser);
router.delete('/:id/follow', authMiddleware, unfollowUser);

export default router;
