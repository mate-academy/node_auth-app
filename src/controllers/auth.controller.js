import { User } from '../models/User.model.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuid } from 'uuid';

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const activationToken = uuid();

  const newUser = await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
  res.send(newUser);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};

export const authController = {
  register,
  activate,
};
