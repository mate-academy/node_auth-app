import bcrypt from "bcrypt";
import { v4 as uuidv4} from "uuid";
import { authService } from "../services/auth.service.js";
import { emailService } from "../services/email.service.js";
import { usersService } from "../services/users.service.js";
import { jwtService } from "../services/jwt.service.js";
import { ApiError } from "../exeptions/api.error.js";
import { validateUtils } from "../utils/validation.js";
import {tokenService} from "../services/token.service.js";

const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validateUtils.validateEmail(email),
    password: validateUtils.validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const activationToken = uuidv4();

  const existUser = await authService.getOneUserByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist');
  }

  const hashPass = await bcrypt.hash(password, 10);

  const newUser = await authService.register(email, hashPass, activationToken);

  await emailService.sendActivationMail(email, activationToken);

  res.send(newUser);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await authService.getOneUserByActToken(activationToken);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.getOneUserByEmail(email);

  if (user.activationToken !== null) {
    throw ApiError.badRequest('Please check email and activate ur account');
  }

  const isPassValid = bcrypt.compare(password, user.password)

  if (!user || !isPassValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const refresh = async(req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken)

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  await generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = usersService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  })

  res.send({
    user: normalizedUser,
    accessToken,
  })
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  res.clearCookie('refreshToken');

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const resetLink = async (req, res) => {
  const { email } = req.body;

  const errors = {
    email: validateUtils.validateEmail(email),
  };

  if (errors.email) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const resetToken = uuidv4();

  const existUser = await authService.getOneUserByEmail(email);

  if (!existUser) {
    throw ApiError.badRequest('Create account');
  }

  if (existUser.activationToken !== null) {
    throw ApiError.badRequest('Please check email and activate ur account');
  }

  existUser.activationToken = resetToken;
  existUser.save();

  await emailService.sendResetMail(email, resetToken);

  res.status(200).send({ message: 'Email sent for password reset.'});
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const user = await authService.getOneUserByActToken(resetToken);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.password = await bcrypt.hash(password, 10);
  user.activationToken = null;
  user.save();

  res.status(200).send({ message: 'Password successfully changed'});
};

export const authController = {
  register, activate, login, refresh, logout, resetLink, resetPassword
};
