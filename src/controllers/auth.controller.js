import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const activationToken = uuidv4();
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

  return res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (user.activationToken) {
    return res.status(403).send({ message: 'Activate your account via email' });
  }

  if (!user || user.password !== password) {
    return res.status(401).send({ message: 'Wrong email or password' });
  }

  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

export const authController = {
  register,
  activate,
  login,
};
