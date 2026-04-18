import { User } from "../models/user.js";
import { userService } from "../services/user.service.js";
import { jwtService } from "../services/jwt.service.js";
import { ApiError } from "../exceptions/api.error.js";
import bcrypt from 'bcrypt';
import { tokenService } from "../services/token.service.js";

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Email is not valid';
}

const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'At least 6 characters';
};

const validateName = (value) => {
  if (!value) return 'Name is required';
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  }

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('bad request', errors)
  }

  const hashedPass = await bcrypt.hash(password, 10)

  await userService.register(name, email, hashedPass);
  res.send({ message: 'OK' });
}

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken }})

  if (!user) {
    res.sendStatus(404);

    return;
  }
  user.activationToken = null;
  user.save();

  return res.send(user);
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password')
  }

  generateTokens(res, user);
}

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken)

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
}

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken)
  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  })
  res.send({
    user: normalizedUser,
    accessToken,
  })
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(user.id);
  res.sendStatus(204);
}

const requestResetPassword = async (req, res) => {
  const { email } = req.body;

  const emailExist = userService.findByEmail(email);

  if (!emailExist) {
    throw ApiError.badRequest('No such email registered');
  }

  await userService.createResetToken(email);
  res.sendStatus(200);
}

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ where: { resetToken: token }});

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.resetToken = null;
  user.resetTokenExpires = null;
  user.password = await bcrypt.hash(password, 10);

  await user.save();

  res.sendStatus(200);
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestResetPassword,
  resetPassword,
}
