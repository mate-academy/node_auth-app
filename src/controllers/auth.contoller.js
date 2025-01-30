import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../services/email.service.js';
import { jwtService } from '../services/jwt.service.js';

const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const existingUser = await userService.getByEmail(email);

  if (existingUser) {
    return res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const token = uuidv4();

  const newUser = await userService.create(email, hashPassword, token);

  await emailService.sendActivationLink(email, token);

  res.send(newUser);
};

const activate = async (req, res) => {
  const { email, token } = req.params;

  const user = await userService.getByEmail(email);

  if (!user || user.activationToken !== token) {
    return res.status(404);
  }

  user.activationToken = null;
  await user.save();

  const normalizedUser = userService.normalize(user);

  res.json({
    user: normalizedUser,
    accessToken: jwtService.generateAccessToken(normalizedUser),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  const isValidPassword = bcrypt.compare(password, user?.password || '');

  if (!user || !isValidPassword) {
    res.status(401).json({ message: 'Invalid credentials' });
  }

  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(normalizedUser);

  res.send({ user: normalizedUser, accessToken });
};

export const authController = {
  register,
  activate,
  login,
};
