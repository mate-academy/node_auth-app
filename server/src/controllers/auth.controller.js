import { ApiError } from "../exceptions/api.error.js";
import { User } from "../models/user.js";
import { emailService } from "../services/email.service.js";
import { jwtService } from "../services/jwt.service.js";
import { userService } from '../services/user.service.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { tokenService } from "../services/token.service.js";
import { validationService } from "../services/validation.service.js";

const  generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 60 * 60 * 1000,
    HttpOnly: true,
  })

  res.send({
    user: normalizedUser,
    accessToken
  })
}

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const errors = {
    email: validationService.validateEmail(email),
    password: validationService.validatePassword(password),
    name: validationService.validateName(name),
  }

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('Bad request', errors)
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register({ email, password: hashedPass, name });
  res.send('OK');
}

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } })

  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.activationToken = null;
  user.save();

  res.send(userService.normalize(user));
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password', { password: 'is not correct' })
    return
  }

  if (user.activationToken) throw ApiError.notActivated()

  generateTokens(res, user);
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  tokenService.remove(userData.id);

  res.sendStatus(204);
}

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw ApiError.unauthorized('Missing refresh token');
  }
  const user = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user)
}

const password = async (req, res) => {
  const { oldPassword, password, confirmPassword } = req.body;
  const authorization = req.headers['authorization'] || '';
  const [_, token] = authorization.split(' ');
  const userData = await jwtService.verify(token);
  console.log('@@ 0')

  if (!userData) {
    throw ApiError.unauthorized();
  }

    console.log('@@ 1')

  const user = await userService.findById(userData.id);
  console.log('@@ 2')

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

    console.log('@@ 3')

  const oldPasswordValidation = await validationService.validateOldPassword(oldPassword, user.password);
    console.log('@@ 4')

  const errors = {
    oldPassword: oldPasswordValidation,
    password: validationService.validatePassword(password),
    confirmPassword: validationService.validateConfirmPassword(password, confirmPassword),
  }

  if (errors.oldPassword || errors.password || errors.confirmPassword) {
    throw ApiError.badRequest('Bad request', errors)
  }

   const hashedPass = await bcrypt.hash(password, 10);
   user.password = hashedPass;

   await user.save();

   res.send('Successfully changed password!');
}

const resetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Email is not found');
  }

  const passwordResetToken = uuidv4();

  user.passwordResetToken = passwordResetToken;

  await user.save()
  await emailService.sendPasswordResetActivation(passwordResetToken, email);

  res.send('Ok');
}

const resetPasswordConfirm = async (req, res) => {
  const { password, confirmPassword, token } = req.body;

  const user = await userService.findByPasswordResetToken(token);

  if (!user) {
    throw ApiError.badRequest('Token is not found');
  }

  const errors = {
    password: validationService.validatePassword(password),
    confirmPassword: validationService.validateConfirmPassword(password, confirmPassword),
  }

  if (errors.password || errors.confirmPassword) {
    throw ApiError.badRequest('Bad request', errors)
  }
  const hashedPass = await bcrypt.hash(password, 10);

  user.passwordResetToken = null;
  user.password = hashedPass;

  await user.save();

  res.send(userService.normalize(user));
}

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  password,
  resetPassword,
  resetPasswordConfirm
}