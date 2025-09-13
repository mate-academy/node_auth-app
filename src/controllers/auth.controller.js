import * as userModel from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import bcrypt from 'bcrypt';
import { sendActivationEmail } from '../services/email.service.js';
import { validateService } from '../services/validation.service.js';
import { tokenService } from '../services/token.service.js';
import nodeCrypto from 'crypto';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const isValidPassword = validateService.isPassword(password);
    const isValidEmail = validateService.isEmail(email);

    if (!isValidEmail) {
      return res.status(400).json({ message: 'Use valid email' });
    }

    if (!isValidPassword) {
      return res.status(400).json({
        message: 'Use valid password (8+ chars, 1+ special symbol...)',
      });
    }

    const isUserExist = await userModel.findByEmail(email);

    if (isUserExist) {
      return res.status(400).json({ message: 'User already exist' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Name are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await userModel.createUser(name, email, passwordHash);

    const activationBaseUrl =
      process.env.ACTIVATION_BASE_URL || 'http://localhost:3000/auth/activate';
    const activationLink = `${activationBaseUrl}?token=${encodeURIComponent(newUser.activationToken)}`;

    await sendActivationEmail({ to: email, activationLink });

    const user = userModel.normalizeUser(newUser);

    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Не вдалося створити користувача' });
  }
};

export const activate = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Activation token is required' });
    }

    const user = await userModel.activateByToken(String(token));

    if (!user) {
      return res.status(404).json({ message: 'Invalid activation token' });
    }

    await generateTokens(req, user);

    return res.redirect('/profile');
  } catch (err) {
    return res.status(500).json({ message: 'Activation failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'User doesnt exist' });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: 'Please activate your account via email' });
    }

    const isPassMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isPassMatch) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    generateTokens(res, user);
    // res.status(200).send({ accessToken, message: 'Logged in successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const user = jwtService.verifyRefresh(refreshToken);
    const token = await tokenService.getByToken(refreshToken);

    if (!user || !token) {
      return res.status(400).json({ message: 'Unauthorized' });
    }

    generateTokens(res, user);
  } catch (er) {
    return res.status(500).json({ message: 'Bad request' });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({ message: 'No refresh token provided' });
    }

    const userData = await jwtService.verifyRefresh(refreshToken);

    if (!userData) {
      return res.status(400).json({ message: 'Unauthorized' });
    }

    await tokenService.remove(userData.id);

    res.clearCookie('refreshToken');

    return res.sendStatus(204);
  } catch (err) {
    return res.status(500).json({ message: 'Bad request' });
  }
};

export const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(201).json({ message: 'Лист надіслано' });
    }

    const token = nodeCrypto.randomBytes(32).toString('hex');

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const RESET_BASE_URL = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetLink = `${RESET_BASE_URL}/auth/reset-password/confirm?token=${token}`;

    sendActivationEmail({ to: user.email, activationLink: resetLink });

    return res.status(201).json({ message: 'Лист надіслано' });
  } catch (err) {
    return res.status(500).json({ message: 'Bad request' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, confirmation, token, email } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(401);
    }

    if (
      !token ||
      user.resetToken !== token ||
      user.resetTokenExpiry < Date.now()
    ) {
      return res.status(401).json({ message: 'No token or token is expired' });
    }

    if (!password || !confirmation) {
      return res.status(401).json({ message: 'No data to reset a password' });
    }

    if (password !== confirmation) {
      return res.status(401).json({ message: 'Passwords dont matches' });
    }

    const isTruePassword = validateService.isPassword(password);

    if (!isTruePassword) {
      return res.status(401).json({
        message: 'Use valid password (8+ chars, 1+ special symbol...)',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    user.passwordHash = passwordHash;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res
      .status(201)
      .json({ message: 'Password was successfully changed' });
  } catch (err) {
    return res.status(500).json({ message: 'Bad request' });
  }
};

const generateTokens = async (res, user) => {
  const normalizedUser = userModel.normalizeUser(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'Strict',
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};
