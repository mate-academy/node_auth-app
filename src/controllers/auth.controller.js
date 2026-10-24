import bcrypt from 'bcrypt';
import * as userService from '../services/user.service.js';
import * as validation from '../utils/validators.js';
import { sendActivationEmail } from '../utils/mailer.js';
import { uuid } from 'uuidv4';
import * as tokenService from '../services/token.service.js';

export const register = async (req, res) => {
  // eslint-disable-next-line no-shadow
  const { name, email, password } = req.body;

  const errors = {
    name: validation.validateName(name),
    email: validation.validateEmail(email.trim().toLowerCase()),
    password: validation.validatePassword(password),
  };

  if (Object.values(errors).some((error) => typeof error === 'string')) {
    res.status(400).send({ errors });

    return;
  }

  if (await userService.getByEmail(email.trim().toLowerCase())) {
    res.sendStatus(409);

    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const activationToken = uuid();
    const user = await userService.create({
      name,
      email,
      passwordHash,
      activationToken,
    });

    await sendActivationEmail(user.email, activationToken);

    res.status(201).send({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.sendStatus(409);

      return;
    }

    // eslint-disable-next-line no-console
    console.error(error);

    res.sendStatus(500);
  }
};

export const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await userService.getByActivationToken(activationToken);

  if (!user) {
    res.status(404).send('Invalid or already used activation link');

    return;
  }

  user.activationToken = null;
  user.isActive = true;
  await user.save();

  res.redirect(`/profiles/${user.id}`);
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userService.getByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userService.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Please activate your email before logging in',
      });
    }

    await setCookie(user, res);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const loadProfile = async (req, res) => {
  const { id } = req.params;

  const user = await userService.getById(id);

  if (!user) {
    res.status(404).send('User profile not found');

    return;
  }

  const { name, email } = user;

  res.send({ name, email });
};

export const setCookie = async (user, res) => {
  const accessToken = tokenService.generateAccessToken(user.id);
  const refreshToken = await tokenService.generateRefreshToken(user.id);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokenService.REFRESH_TTL_MS,
    path: '/auth',
  });

  return res.status(200).json({ accessToken });
};
