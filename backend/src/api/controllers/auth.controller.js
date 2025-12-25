import { User } from "../../models/user.js"
import { userServices } from "../../services/user.service.js";
import { jwtService } from "../../services/jwt.service.js";
import { ApiError } from "../../exceptions/api.error.js";
import bcrypt from "bcrypt";
import { tokenServices } from "../../services/token.service.js";

function validateName(value) {
  const name = value.trim();
  const NAME_PATTERN = /^[\p{L}\s'-]{2,30}$/u;

  if (!name) {
    return "Name is required";
  }

  if (!NAME_PATTERN.test(name)) {
    return "Name is not valid";
  }
}

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) return "Email is required";
  if (!EMAIL_PATTERN.test(value)) return "Email is not valid";
}

function validatePassword(value) {
  if (!value) return "Password is required";
  if (value.length < 6) return "At least 6 characters";
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  }

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await userServices.register(name, email, hashedPassword);

  res.send({ message: 'Ok' });
}

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.activationToken = null;
  await user.save();
  res.send(user);
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userServices.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken !== null) {
    throw ApiError.unathorized('Account is not activated');
  }

  await generateTokens(res, user);
}

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenServices.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unathorized();
  }

  const user = await userServices.findByEmail(userData.email);

  if (user.activationToken !== null) {
    throw ApiError.unathorized('Account is not activated');
  }

  await generateTokens(res, user);
}

async function generateTokens(res, user) {
  const normalizedUser = userServices.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenServices.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 1000,
    httpOnly: true
  });

  res.send({
    user: normalizedUser,
    accessToken
  })
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unathorized();
  }

  await tokenServices.remove(userData.id);
  res.sendStatus(204);
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout
}
