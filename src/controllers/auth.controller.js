import { createUserSchema } from '../helpers/schemas_users.js';
import bcrypt from 'bcrypt';
import { userService } from '../services/user.service.js';
import { User } from '../models/User.model.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';

const create = async (req, res) => {
  const { name, email, password } = req.body;

  await createUserSchema.validate({ name, password, email });

  const userExists = await userService.getByEmail(email);

  if (userExists) {
    return res.status(409).send({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.createUser(name, email, hashedPassword);

  return res.status(201).send();
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  user.activationToken = null;

  await user.save();
  await sendAuthentication(res, user);

  res.status(200).send();
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    return res
      .status(401)
      .send({ message: 'User with this email does not exist' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).send({ message: 'Invalid password' });
  }

  await sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    return res.status(401).send({ message: 'Invalid refresh token' });
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    return res.status(401).send({ message: 'Invalid refresh token' });
  }

  const user = await userService.getByEmail(userData.email);

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
};

export const sendAuthentication = async (res, user) => {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
};

export const authController = {
  create,
  activate,
  login,
  refresh,
  logout,
};
