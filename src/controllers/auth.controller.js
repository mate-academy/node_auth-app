import { User } from '../models/User.model.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuid } from 'uuid';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';

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

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user || user.password !== password) {
    res.sendStatus(401);

    return;
  }

  const normolizedUser = userService.normolize(user);

  const accessToken = jwtService.sign(normolizedUser);

  res.send({
    user: normolizedUser,
    accessToken,
  });
};

export const authController = {
  register,
  activate,
  login,
};
