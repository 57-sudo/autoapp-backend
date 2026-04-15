import { Router } from 'express';
import { getConversations, getMessages, createConversation } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/conversations', authMiddleware, getConversations);
router.get('/conversations/:id/messages', authMiddleware, getMessages);
router.post('/conversations', authMiddleware, createConversation);

export default router;
