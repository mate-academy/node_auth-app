'use strict';
import { authMiddleware } from '../middlewares/authMiddleware.js';
// import { ownerMiddleware } from '../middlewares/ownerMiddleware.js';
import express from 'express';
import {
  getAllUsers,
  getUserById,
  getUserByActivationToken,
  createUser,
  // updateUser,
  updateUserActivated,
  loginUser,
  changeUserName,
  changeUserPassword,
  changeUserEmail,
  resetUserPassword,
  resetPassword,
  refresh,
  logout,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/registration', createUser);

router.post('/login', loginUser);
router.get('/refresh', refresh);
router.post('/reset-password', resetPassword);
router.patch('/reset-password/:resetToken', resetUserPassword);

router.patch('/activation/:activationToken', updateUserActivated);
router.get('/activation/:activationToken', getUserByActivationToken);

router.patch(
  '/:id/change-name',
  authMiddleware,
  // ownerMiddleware,
  changeUserName,
);

router.patch(
  '/:id/change-password',
  authMiddleware,
  // ownerMiddleware,
  changeUserPassword,
);

router.patch(
  '/:id/change-email',
  authMiddleware,
  // ownerMiddleware,
  changeUserEmail,
);
router.get('/:id', authMiddleware, getUserById);
// router.get('/me', authMiddleware, async (req, res) => {
//   const user = await User.findByPk(req.user.id);
//   res.json(user);
// });
router.post('/logout', logout);
export default router;
