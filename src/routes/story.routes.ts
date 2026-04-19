import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getStories,
  createStory,
  viewStory,
  deleteStory,
  getMyStories,
} from '../controllers/story.controller';

const router = Router();

router.use(protect);

router.get('/', getStories);
router.get('/my', getMyStories);
router.post('/', createStory);
router.patch('/:id/view', viewStory);
router.delete('/:id', deleteStory);

export default router;
