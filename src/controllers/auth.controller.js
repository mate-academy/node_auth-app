import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { sessionService } from '../services/session.service.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../services/email.service.js';

const registration = async (req, res) => {
  const { name, email, password } = req.body;

  await userService.register(name, email, password);

  // console.log(`
  //   Name: ${name},
  //   Email: ${email},
  //   Password: ${password}
  //  `);

  res.send({
    message: 'Registration was successful',
  });
};

const activate = async (req, res) => {
  // console.log('Inside activation method');
  const { activationToken } = req.params;

  const user = await userService.findByToken(activationToken);

  if (!user) {
    return ApiError.notFound();
  }

  user.activationToken = null;
  await user.save();

  // console.log('User activated');

  const normalizedUser = await userService.normalizeUser(user);

  res.send(normalizedUser);
};

const login = async (req, res) => {
  // console.log('Inside authController/login');
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email and/or password are not provided');
  }

  const user = await userService.getUserByEmail(email);

  if (!user) {
    return ApiError.badRequest('User not found');
  }

  if (user.password !== password) {
    return ApiError.badRequest('Wrong password');
  }

  if (user.activationToken) {
    return res.send({
      message: 'You need to activate profile first',
    });
  }

  // console.log('Email and password matches, generating new tokens');

  const isNotInitialLogin = await sessionService.findByUserId(user.id);

  if (!isNotInitialLogin) {
    // console.log('Initialized session for new user');
    await sessionService.initializeSession(user.id);
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  // console.log('Inside authController/refresh');
  const { refreshToken } = req.cookies;

  const user = await jwtService.verifyRefresh(refreshToken);
  const dbToken = await tokenService.getByToken(refreshToken);

  if (!user || !dbToken) {
    // console.log(
    //   'Couldnt verify refreshToken or refreshToken from cookies !== dbToken',
    // );
    throw ApiError.unAuthorized();
  }

  // console.log('Tokens are equal, generating new tokens');
  await generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  // console.log('Inside authController/generateTokens');
  const normalizedUser = await userService.normalizeUser(user);

  const tokenVersion = await sessionService.findByUserId(normalizedUser.id);
  const normalizedTokenVersion =
    await sessionService.normalizeSession(tokenVersion);

  const newAccessToken = await jwtService.sign(
    normalizedUser,
    normalizedTokenVersion.tokenVersion,
  );
  const refreshToken = await jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
  });

  // console.log('Tokens updated and saved to cookies and DB');
  res.send({
    user: normalizedUser,
    newAccessToken,
  });
};

const logout = async (req, res) => {
  // console.log('Inside authController/logout');
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.badRequest('No refreshToken was passed');
  }

  const user = await tokenService.getByToken(refreshToken);

  if (!user) {
    throw ApiError.badRequest('Refresh tokens are not equal');
  }

  await tokenService.removeByUserId(user.userId);
  await sessionService.updateTokenVersion(user.userId);

  res.send({
    message: 'Successfully logged out',
  });
};

const sendResetPassword = async (req, res) => {
  // console.log('Inside authController/reset');
  const { email } = req.body;

  const user = await userService.getUserByEmail(email);

  if (!user) {
    // console.log('Couldnt find a user with such email');
    throw ApiError.badRequest('No such user');
  }

  const resetToken = uuidv4();

  // console.log(`Generating new token: ${resetToken}, saving to userModel`);
  user.resetToken = resetToken;
  await user.save();

  await emailService.sendResetPassword(user.email, resetToken);
  // console.log('Reset email was sent');

  res.sendStatus(200);
};

const resetPassword = async (req, res) => {
  const { email, password, confirmation } = req.body;
  const { resetToken } = req.params;

  const targetUser = await userService.getUserByEmail(email);

  if (!targetUser) {
    throw ApiError.badRequest('No such user');
  }

  if (!resetToken) {
    throw ApiError.badRequest('Couldnt verify request, no resetToken provided');
  }

  if (targetUser.resetToken !== resetToken) {
    throw ApiError.badRequest('Reset tokens are not equal');
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Password and confirmation are not equal');
  }

  targetUser.password = password;
  targetUser.resetToken = null;
  await targetUser.save();

  // console.log('Password for a targetUser has changed');
  res.sendStatus(200);
};

export const authController = {
  registration,
  activate,
  login,
  refresh,
  logout,
  sendResetPassword,
  resetPassword,
};
