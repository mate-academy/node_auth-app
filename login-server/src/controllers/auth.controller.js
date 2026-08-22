import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';

const register = async (req, res) => {
  const { email, password } = req.body;

  await userService.register(email, password);
  res.send({ message: 'Ok' });
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
