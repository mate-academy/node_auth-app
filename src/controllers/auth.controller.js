import { User } from "../models/User.model.js";
import { findByEmail } from "../utils/findByEmail.js";
import { jwtService } from "../service/jwt.service.js";
import { normalize } from "../utils/normalize.js";
import { authService } from "../service/auth.service.js";
import { ApiError } from "../exeptions/api.error.js";
import bcrypt from 'bcrypt';
import { tokenService } from "../service/token.service.js";
import { validateInput } from "../utils/validateInput.js";

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateInput.validateEmail(email),
    password: validateInput.validatePassword(password),
  };

  if (errors.email || errors.password) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const hashedPass = await bcrypt.hash(password, 10)
  await authService.register(name, email, hashedPass);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

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

  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPassValid = await bcrypt.compare(password, user.password);

  if (!isPassValid) {
    throw ApiError.badRequest('Wrong password');
  }

  generateTokens(res, user);
}

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unAuthorized();
  }

  const user = await findByEmail(userData.email);

  await generateTokens(res, user);
}

const generateTokens = async (res, user) => {
  const normalizedUser = normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  })
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unAuthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout
}