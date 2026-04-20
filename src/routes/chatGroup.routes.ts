import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  getMyGroups,
  createGroup,
  getGroupMessages,
  sendGroupMessage,
  addGroupMembers,
  removeGroupMember,
  leaveGroup,
  deleteGroup,
} from '../controllers/chatGroup.controller';

const router = Router();

router.use(protect);

router.get('/', getMyGroups);
router.post('/', createGroup);
router.get('/:groupId/messages', getGroupMessages);
router.post('/:groupId/messages', sendGroupMessage);
router.patch('/:groupId/members', addGroupMembers);
router.delete('/:groupId/members/:userId', removeGroupMember);
router.post('/:groupId/leave', leaveGroup);
router.delete('/:groupId', deleteGroup);

export default router;
