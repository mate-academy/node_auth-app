import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    res.status(400).send({ errors });

    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(email, hashedPassword, name);
  res.send({ message: 'ok' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  await generateTokens(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    res.status(401).json({ message: 'User not found' });

    return;
  }

  if (user.activationToken) {
    res.status(403).json({ message: 'Please activate your account' });

    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Password is incorrect' });

    return;
  }

  generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const user = await jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    res.sendStatus(401);

    return;
  }

  tokenService.removeById(user.id);
  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    res.sendStatus(401);

    return;
  }

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalizeUser(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.saveToken(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findByEmail({ where: { email } });
  const resetPasswordToken = uuidv4();

  if (!user) {
    res.status(401).json({ message: 'User not found' });

    return;
  }

  user.resetPasswordToken = resetPasswordToken;
  await user.save();

  await emailService.sendResetPasswordEmail(email, resetPasswordToken);

  res.send({ message: 'ok' });
};

const confirmPasswordChange = async (req, res) => {
  const { resetToken } = req.params;

  res.send(resetToken);
};

const passwordChange = async (req, res) => {
  const { resetPasswordToken, newPassword, newPasswordConfirmation } = req.body;

  if (newPassword !== newPasswordConfirmation) {
    res.status(401).json({ message: 'Passwords are not equal' });

    return;
  }

  const user = await User.findOne({ where: { resetPasswordToken } });
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.resetPasswordToken = null;
  user.password = hashedPassword;

  await user.save();

  res.json({ message: 'Password successfully reset' });
};

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  resetPasswordRequest,
  confirmPasswordChange,
  passwordChange,
};
