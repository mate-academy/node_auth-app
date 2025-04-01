/* eslint-disable no-console */
const { User } = require('../models/user');
const bcrypt = require('bcrypt');
const moment = require('moment');

const { sign, verifyRefresh, signRefresh } = require('../services/jwtService');
const { save, getByToken, remove } = require('../services/tokenService');
const { sendGoodbyeEmail } = require('../services/mailService');
const {
  resetPasswordUser,
  removeResetToken,
  findUserByResetToken,
} = require('../services/resetToken');
const {
  findByEmail,
  normalize,
  registerUser,
  findUserById,
  findByEmailAndId,
} = require('../services/userService');

const { ApiError } = require('../exceptions/apiError');

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern) {
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

function validateName(value) {
  if (value.length < 3) {
    return 'At least 3 characters';
  }
}

const generateTokens = async (res, user) => {
  const normalizedUser = normalize(user);
  const accessToken = sign(normalizedUser);
  const refreshToken = signRefresh(normalizedUser);

  await save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const register = async (req, res, next) => {
  try {
    console.log('Received registration data:', req.body);

    const { name, email, password } = req.body;

    const errors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (errors.email || errors.password || errors.name) {
      throw new ApiError('Bad request', errors);
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User with this email already exists' });
    }

    const hashPass = await bcrypt.hash(password, 10);

    await registerUser(name, email, hashPass);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such users');
  }

  const { activationToken } = user;

  if (activationToken) {
    throw ApiError.badRequest(
      'Please check your inbox and activate your email',
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  console.log('Activation token received:', activationToken);

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    console.log('User not found with token:', activationToken);

    return res.sendStatus(404);
  }

  console.log('User found:', user);

  user.activationToken = null;
  await user.save();

  await generateTokens(res, user);
  res.send(user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const token = await getByToken(refreshToken);

  if (!token) {
    throw ApiError.unauthorized();
  }

  const user = await findByEmail(userData.email);

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await remove(userData.id);

  res.sendStatus(204);
};

const reset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiError.unauthorized();
  }

  await resetPasswordUser(email);

  res.sendStatus(200);
};

const resetPassword = async (req, res) => {
  const { newPassword, newPasswordConfirmation, resetToken } = req.body;

  if (!newPassword || !newPasswordConfirmation || !resetToken) {
    throw ApiError.badRequest('All fields are required.');
  }

  if (newPassword.trim() !== newPasswordConfirmation.trim()) {
    throw ApiError.badRequest('Passwords are not equal');
  }

  const token = await findUserByResetToken(resetToken);

  if (!token || !token.userId) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const user = await findUserById(token.userId);

  if (!user) {
    throw ApiError.badRequest('No such user!');
  }

  const hashPass = await bcrypt.hash(newPassword, 10);

  user.password = hashPass;
  await removeResetToken(token.resetToken);

  await user.save();

  res.send('Password reset successfully');
};

const resetChecker = async (req, res) => {
  const { resetToken } = req.params;
  const userToken = await findUserByResetToken(resetToken);

  console.log('Received resetToken on server:', resetToken);

  if (!userToken) {
    throw ApiError.notFound();
  }

  const currentTime = moment();

  if (currentTime.isAfter(userToken.expirationTime)) {
    throw ApiError.badRequest('Expired reset token, please request new token');
  }

  res.send(userToken);
};

const updateUserName = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await findByEmail(email);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    user.name = name;
    await user.save();

    res.send(normalize(user));
  } catch (err) {
    res.status(500).send({ message: 'Internal server error' });
  }
};

const changeAuthPass = async (req, res) => {
  const { id, email, oldPassword, newPassword, newPasswordConfirmation } =
    req.body;
  const user = await findByEmailAndId(id, email);

  if (!user) {
    throw ApiError.badRequest('User is not found');
  }

  if (newPassword !== newPasswordConfirmation) {
    throw ApiError.badRequest('Password is not the same');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Your current password wrong');
  }

  const hashPass = await bcrypt.hash(newPassword, 10);

  user.password = hashPass;

  await user.save();

  await generateTokens(res, user);
};

const changeEmail = async (req, res) => {
  const { user } = req.body;

  const currentUser = await findUserById(user.id);

  const findAnotherUserByEmail = await findByEmail(user.email);

  if (findAnotherUserByEmail) {
    throw ApiError.badRequest('This email is already exist');
  }

  if (!currentUser) {
    throw ApiError.badRequest('User is not found');
  }

  if (currentUser.email === user.email) {
    throw ApiError.badRequest('Email is the same');
  }

  const isPasswordValid = await bcrypt.compare(
    user.password,
    currentUser.password,
  );

  if (!isPasswordValid) {
    throw ApiError.badRequest('Your password is wrong');
  }

  await sendGoodbyeEmail(currentUser.name, user.email, currentUser.email);

  currentUser.email = user.email;

  currentUser.save();

  await generateTokens(res, currentUser);
};

module.exports = {
  register,
  login,
  activate,
  refresh,
  logout,
  reset,
  resetPassword,
  resetChecker,
  updateUserName,
  changeAuthPass,
  changeEmail,
};
