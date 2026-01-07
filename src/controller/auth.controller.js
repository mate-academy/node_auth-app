/* eslint-disable no-useless-return */
import { userServices } from '../services/user.services.js';
import { emailServices } from '../services/email.services.js';
import { jwtService } from '../services/jwt.services.js';
import bcrypt, { compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.model.js';

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Email is not valid';
  }
}

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.trim().length < 4) {
    return 'Name length must be more than 4 symbols';
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

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const activationToken = uuidv4();

    if (!name || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });

      return;
    }

    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
      name: validateName(name),
    };

    if (errors.email || errors.password || errors.name) {
      res.status(400).json(errors);

      return;
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    await userServices.registerUser(name, email, hashPassword, activationToken);

    await emailServices.sendActivationEmail(email, activationToken);

    res
      .status(201)
      .json({ message: 'User registered. Check your email for activation.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const activateUser = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });

    return;
  }

  user.activationToken = null;
  await user.save();

  res.redirect('/profile');
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  const user = await userServices.findUser(email);

  if (!user) {
    res.status(401).json({ message: 'User not found' });

    return;
  }

  if (user.activationToken !== null) {
    res.status(403).json({ message: 'Please activate your email' });

    return;
  }

  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Invalid credentials' });

    return;
  }

  await generateTokens(res, user);
  res.redirect('/profile');
};

const refresh = (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);

  if (!user) {
    res.sendStatus(401);

    return;
  }

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normilizeUser = userServices.normilizeUser(user);
  const accessToken = jwtService.sign(normilizeUser);
  const refreshToken = jwtService.signRefresh(normilizeUser);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normilizeUser,
    accessToken,
  });
};

const logout = (req, res) => {
  res.clearCookie('refreshToken').redirect('/login');
};

const forgot = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: 'Email is required' });

    return;
  }

  const user = await userServices.findUser(email);

  if (!user) {
    res.sendStatus(200);

    return;
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;

  await user.save();
  await emailServices.sendResetPasswordEmail(email, resetToken);

  res.send({ message: 'Password reset email sent' });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmation } = req.body;

  if (!password || password !== confirmation) {
    res.status(400).json({ message: 'Passwords do not match' });

    return;
  }

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    res.status(400).json({ message: 'Invalid reset token' });

    return;
  }

  user.password = bcrypt.hashSync(password, 10);
  user.resetToken = null;

  await user.save();

  res.send({ message: 'Password successfully changed' });
};

export const authController = {
  registerUser,
  activateUser,
  loginUser,
  refresh,
  logout,
  forgot,
  resetPassword,
};
