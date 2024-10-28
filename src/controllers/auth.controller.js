import { User } from "../models/user.js";
import { userService } from "../services/user.service.js";
import { jwtService } from "../services/jwt.service.js";
import { ApiError } from "../exeptions/api.error.js";
import bcrypt from 'bcrypt';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
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

async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });
  res.send({
    user: normalizedUser,
    accessToken
  });
}

const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10); // problem

  await userService.register(email, hashedPassword);

  res.send({ message: 'Okay' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken }});

  if (!user) {
    return res.status(404).send('No such user');
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isUserValide = await bcrypt.compare(password, user.password);

  if (!isUserValide) {
    throw ApiError.badRequest('Incorrect password');
  }

  generateTokens(res, user);

  // const normalizedUser = userService.normalize(user);
  // const accessToken = jwtService.sign(normalizedUser);

  // res.send({
  //   user: normalizedUser,
  //   accessToken
  // });
};

const refresh = (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);

  if (!user) {
    throw ApiError.unAuthorized();
  }

  generateTokens(res, user);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
};
