import { Router } from 'express';
import { register, login, googleAuth, appleAuth, getMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleAuth);
router.post('/apple', appleAuth);
router.get('/me', authMiddleware, getMe);

export default router;
