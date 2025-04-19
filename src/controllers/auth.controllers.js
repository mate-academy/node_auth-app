import { User } from '../models/User.model.js';
import { userServices } from '../services/user.services.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';

const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

function validateEmail(value) {
  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Email is not valid';
}

function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'At least 6 characters';
}

const registration = async (req, res) => {
  const { email, password, name } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  }

  if (errors.email || errors.password || !name) {
    throw ApiError.badRequest('Use correct values', errors);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userServices.registration(email, hashedPassword, name);

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(`Something wrong with registration, ${error}`)
  }

};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.status(404).send('Cannot find user');
    return;
  }

  user.activationToken = null;
  await user.save();

  res.redirect('/user');
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userServices.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User doues not exist');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
  res.redirect('/user');
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(401).send('Unauthorized');
  }

  const user = jwtService.refreshVerify(refreshToken);

  const token = tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  const data = await generateTokens(res, user);

  res.status(200).send(data);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userServices.normilize(user);

  const accessToken = jwtService.sigh(normalizedUser);
  const refreshToken = jwtService.refreshSigh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true
  })
  res.send({
    user: normalizedUser,
    accessToken,
  })
};

const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

export const authControllers = {
  registration,
  activate,
  login,
  refresh,
  logout,
};
