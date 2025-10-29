import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import bcrypt from 'bcrypt';

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    return res
      .status(400)
      .send({ message: 'Invalid email or password format', errors });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = uuidv4();

  const existingUser = await userService.findByEmail(email);

  if (existingUser) {
    return res.status(409).send({ message: 'Email already exists' });
  }
  const newUser = await User.create({ email, hashedPassword, activationToken });

  emailService.sendActivationEmail(email, activationToken);
  res.status(201).send(newUser);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.status(404).send({ message: 'Invalid activation token' });
  }

  user.activationToken = null;
  user.save();

  res.status(200).send({ message: 'Account activated successfully' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!user || user.password !== password) {
    return res.status(401).send({ message: 'Invalid email or password' });
  }

  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sing(normalizedUser);

  res.status(200).send({ user: normalizedUser, accessToken });
};

const logout = (req, res) => {
  req.user = null;

  res.send({ message: 'Logged out successfully' });
};

export const authController = {
  register,
  activate,
  login,
  logout,
};
