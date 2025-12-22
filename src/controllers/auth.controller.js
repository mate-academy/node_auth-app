import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { jwt } from '../utils/jwt.js';
import { validate } from '../utils/validation.js';
import bcrypt from 'bcrypt';

const register = async (req, res) => {
  const { email, password, userName } = req.body;

  const errors = {
    email: validate.email(email),
    password: validate.password(password),
    name: validate.name(userName),
  };

  if (errors.email || errors.password || errors.name) {
    res.status(400).send(errors);

    return;
  }

  try {
    await userService.register(email, password, userName);

    res.sendStatus(201);
  } catch (error) {
    return res.status(400).send({
      message: error.message,
    });
  }
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  try {
    const user = await userService.activate(activationToken);

    sendAuthentication(res, user);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.sendStatus(400);
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';

  const userData = jwt.validateRefreshToken(refreshToken);
  const user = await userService.findBy(userData?.email || '');
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token || !user || token.userId !== user.id) {
    res.clearCookie('refreshToken');

    res.status(401).json({
      message: 'Invalid token',
    });

    return;
  }

  if (!user) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);

  if (userData) {
    await tokenService.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const sendAuthentication = async (res, user) => {
  const userData = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  await tokenService.deleteByUserId(user.id);
  await tokenService.create(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    accessToken,
    user: userData,
  });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};
