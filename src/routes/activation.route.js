import express from 'express';
import { User } from '../models/user.model.js';

export const activationRouter = express.Router();

activationRouter.get('/activate/:token', async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { verificationToken: token } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }

  user.isActive = true;
  user.verificationToken = null;
  await user.save();

  res.redirect('/profile');
});
