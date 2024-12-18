const { userSchema } = require('../models/user');

const { authServices } = require('../services/auth.services');
const { jwtServices } = require('../services/jwt.services');
const { tokenServices } = require('../services/token.services');
const { usersServices } = require('../services/users.services');
const {
  sendActivationLink,
  sendResetLink,
} = require('../services/email.services');

const { ApiError } = require('../exeptions/auth.error');

const { checkPassword } = require('../utils/password/checkPassword');
const { asyncHandler } = require('../utils/asyncHandler');

const authValidation = async (req, _, next) => {
  const { email, password } = req.body;

  try {
    await userSchema.validate({ email, password });
  } catch (e) {
    throw ApiError.badRequest(e.message);
  }

  req.userData = { email, password };
  next();
};

const sighUp = async (req, res) => {
  const user = !!(await usersServices.getUserByEmail(req.userData.email));

  if (user) {
    throw ApiError.badRequest('User already exists');
  }

  const { email, activationToken } = await authServices.signUp(req.userData);

  sendActivationLink(email, activationToken);

  res
    .status(201)
    .json({ message: 'You need to activate your account, check your email' });
};

const signIn = async (req, res) => {
  const { email, password } = req.userData;

  const user = await usersServices.getUserByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Need to activate an account, check your email');
  }

  if (!(await checkPassword(password, user.password))) {
    throw ApiError.badRequest('Password is wrong');
  }

  const userWithToken = await jwtServices.getUserWithToken(res, user);

  await tokenServices.saveToken(user.id, userWithToken.refreshToken);

  res.status(200).json(userWithToken);
};

const logOut = async (req, res) => {
  const { refreshToken } = req;

  res.clearCookie('refreshToken');

  await tokenServices.removeToken(refreshToken);

  res.sendStatus(204);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  await authServices.activate(activationToken);

  res.status(200).json({ message: 'Your account is activated' });
};

const getResetLink = async (req, res) => {
  const { email } = req.body;

  const user = await usersServices.getUserByEmail(email);

  if (!user) {
    throw ApiError.badRequest('There is no user with the following email');
  }

  const resetToken = await authServices.getResetToken(user, email);

  sendResetLink(email, resetToken);

  res
    .status(200)
    .json({ message: 'The letter sent to email, check your email' });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords must match');
  }

  await authServices.resetPassword(resetToken, password);

  res.status(200).json({ message: 'The password was updated' });
};

module.exports = {
  authController: {
    sighUp: asyncHandler(sighUp),
    authValidation: asyncHandler(authValidation),
    signIn: asyncHandler(signIn),
    logOut: asyncHandler(logOut),
    activate: asyncHandler(activate),
    getResetLink: asyncHandler(getResetLink),
    resetPassword: asyncHandler(resetPassword),
  },
};
