import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';

const register = async (req, res) => {
  const { email, password } = req.body;
  const activationToken = uuidv4();

  const newUser = await User.create({ email, password, activationToken });
  await emailService.sendActivationEmail(email, activationToken);
  res.send(newUser);
};

const activate = async (req, res) => {
  const { activationToken } = req.query;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.activationToken = null;
  await user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user || user.password !== password) {
    res.sendStatus(401);
    return;
  }

  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const getProfile = async (req, res) => {
  res.send(req.user);
};

export const authController = {
  register,
  activate,
  login,
  getProfile,
};
