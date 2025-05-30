import express, { Router, Response } from 'express';
import {
  register,
  login,
  getUsers,
  activateUser,
  requestPasswordReset,
  resetPasswordController,
  updateProfile,
} from '../controllers/authController';
import {
  authenticate,
  AuthenticatedRequest,
} from '../middleware/authMiddleware';
import prisma from '../prismaClient';

const router = Router();

router.post('/register', register as express.RequestHandler);

router.post('/login', login as express.RequestHandler);

router.get('/test', (_, res) => {
  res.send('Auth route is working');
});

router.get(
  '/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Something went wrong' });
    }
  },
);

router.get('/users', getUsers as express.RequestHandler);

router.get('/activate/:token', activateUser as express.RequestHandler);
router.post(
  '/reset-password/request',
  requestPasswordReset as express.RequestHandler,
);

router.post(
  '/reset-password/confirm',
  resetPasswordController as express.RequestHandler,
);

router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  res.json({
    token,
    message:
      'Token is valid, you can now POST new password to /reset-password/confirm',
  });
});

router.patch('/profile', authenticate, updateProfile as express.RequestHandler);

router.post(
  '/logout',
  authenticate,
  (req: AuthenticatedRequest, res: Response) => {
    return res.status(200).json({ message: 'Successfully logged out' });
  },
);

export default router;
