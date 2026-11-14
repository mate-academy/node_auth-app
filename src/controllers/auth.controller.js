import { User } from '../models/user.js';
import { v4 } from 'uuid';

import { emailService } from '../email.js';

export const controllerRegister = async (req, res) => {
  const { email /* password, username */ } = req.body;

  // const newUser = await user.create({ email, password, username });

  const token = v4();

  await emailService.sendConfirmEmail(email, token);

  // res.send(newUser);

  res.redirect('/confirm-email');
};

export const activate = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: token });

  if (!user) {
    res.sendStatus(404);
  }

  user.token = null;
  user.save();
  res.send(user);
};
