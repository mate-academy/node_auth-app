import bcrypt from 'bcrypt';
import ms from 'ms';
import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/Api.error.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';

async function authenticateSession(res, authUser) {
  const user = userService.normalizeUser(authUser);
  const accessToken = jwtService.sign(user);
  const refreshToken = jwtService.signRefresh(user);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: ms(process.env.EXP_IN_REFRESH),
  });

  res.send({
    user,
    accessToken,
  });
}

async function registration(req, res) {
  const { name, email, password } = req.body;

  await userService.registration({ name, email, password });
  res.status(201).send({ message: 'User registered successfully' });
}

async function activation(req, res) {
  const { activationToken } = req.params;

  const user = await userService.activateUserByToken(activationToken);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  await authenticateSession(res, user);
}

async function forgotPasswordRequest(req, res) {
  const { email } = req.body;

  await userService.getResetPasswordJWT(email);

  return res
    .status(201)
    .send({ message: `The password reset link has been sent to ${email}` });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid credentials');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Please, activate your email first');
  }

  const normalizedUser = userService.normalizeUser(user);

  await authenticateSession(res, normalizedUser);
}

async function resetPassword(req, res) {
  const { jwt, newPassword, confirmPassword } = req.body;

  if (!jwt) {
    throw ApiError.badRequest('Not enough parameters', { jwt: 'Is empty' });
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Bad confirmation for the new password', {
      newPassword: 'Not equal to the confirm password',
      confirmPassword: 'Not equal to the new password',
    });
  }

  await userService.resetPassword(jwt, newPassword, confirmPassword);

  res.status(201).send('Password has been successfully updated');
}

async function refresh(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.findByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  await authenticateSession(res, userData.user);
}

async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!refreshToken || !userData) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  await tokenService.remove(userData.user.id);

  res.clearCookie('refreshToken');
  res.sendStatus(204);
}

export const authController = {
  registration,
  forgotPasswordRequest,
  resetPassword,
  activation,
  login,
  refresh,
  logout,
};
