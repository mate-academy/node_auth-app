import { auth } from '../middlewares/auth.middleware.js';
import { Router } from 'express';
import {
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
} from '../controllers/profile.controller.js';

const router = Router();

router.use(auth);

router.get('/', getProfile);
router.put('/name', updateName);
router.put('/password', updatePassword);
router.put('/email', updateEmail);

export default router;
