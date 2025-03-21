import express from 'express';
import { User } from '../models/user.model.js';

const activationRouter = express.Router();

activationRouter.get('/activate/:token', async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { activationToken: token } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid token.' });
  }

  user.isActive = true;
  user.activationToken = null;
  await user.save();

  res.status(200).json({ message: 'Account activated successfully!' });
});

export { activationRouter };
