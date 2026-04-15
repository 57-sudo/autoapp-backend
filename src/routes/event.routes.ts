import { Router } from 'express';
import { getEvents, createEvent, getEvent, joinEvent, leaveEvent } from '../controllers/event.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, getEvents);
router.post('/', authMiddleware, createEvent);
router.get('/:id', authMiddleware, getEvent);
router.post('/:id/join', authMiddleware, joinEvent);
router.delete('/:id/leave', authMiddleware, leaveEvent);

export default router;
