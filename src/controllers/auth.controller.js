import { authService } from '../services/auth.service.js';
import bcrypt from 'bcrypt';
import {
  normalize,
  validateEmail,
  validatePassword,
} from '../utils/validate.js';
import { mailer } from '../utils/mailer.js';
import { jwt } from '../utils/jwt.js';

const register = async (req, res) => {
  const { password, name, email } = req.body;

  if (!password || !name || !email) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const existingUser = await authService.getByEmail(email);

  if (existingUser) {
    return res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const activationToken = bcrypt.genSaltSync(1);

  const user = await authService.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  await mailer.sendActivationLink(email, activationToken);

  return res.status(201).json({
    user: normalize(user),
    activationToken,
  });
};

const activation = async (req, res) => {
  const { email } = req.params;
  const token = req.params.token;

  const user = await authService.getByEmail(email);

  if (!user || user.activationToken !== token) {
    return res.status(404).json({
      message:
        "User with this email doesn't exist or activation token doesn't match!",
    });
  }

  await authService.activation(email);

  res.json(normalize(user));
};

const sendAuthentication = async (res, user) => {
  const userData = normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  const user = await authService.getByEmail(userData.email);

  if (!user) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  await sendAuthentication(res, user);
};

export const authController = {
  register,
  activation,
  login,
  refresh,
};
