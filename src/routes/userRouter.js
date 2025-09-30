import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/me', userController.getProfile);
router.patch('/update-profile', userController.updateProfile);
router.patch('/update-password', userController.updatePassword);
router.patch('/update-email', userController.updateEmail);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export default router;
