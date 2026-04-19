import { Router } from 'express';
import { getFeed, createPost, getPost, likePost, addComment, deletePost } from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth';
import { uploadPostImages } from '../middlewares/upload';

const router = Router();

router.get('/feed', authMiddleware, getFeed);
router.post('/', authMiddleware, uploadPostImages, createPost);
router.get('/:id', authMiddleware, getPost);
router.post('/:id/like', authMiddleware, likePost);
router.post('/:id/comment', authMiddleware, addComment);
router.delete('/:id', authMiddleware, deletePost);

export default router;
