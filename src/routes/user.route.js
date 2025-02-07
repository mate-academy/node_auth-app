import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import userController from '../controllers/user.controller.js';

const router = Router();

router.get('/info', authMiddleware, userController.userInfo);
router.post('/name', authMiddleware, userController.changeName);
router.post('/password', authMiddleware, userController.changePassword);

export default router;
