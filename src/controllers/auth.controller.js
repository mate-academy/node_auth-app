import bcrypt from 'bcrypt';
import { userService } from '../services/user.service.js';
import { emailService } from '../services/email.srvice.js';
import { User } from '../models/user.js';
import { ApiError } from '../exeptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
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

const validateName = (value) => {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 2) {
    return 'At least 2 characters';
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.send({
    message: 'OK',
  });
};

const activation = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  await generateTokens(res, user);
};

const emailSend = async (req, res) => {
  const { email } = req.body;

  const isEmailValid = validateEmail(email);

  if (isEmailValid) {
    throw ApiError.badRequest('Bad request', isEmailValid);
  }

  await emailService.sendResetPasswordEmail(email);

  res.status(200).json({
    message: 'Email was send',
  });
};

const resetPassword = async (req, res) => {
  const { email, password, confirmation } = req.body;

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords is not equal');
  }

  const user = await userService.findByEmail(email);

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  user.save();

  res.status(200).json({
    message: 'Password was changed',
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    // eslint-disable-next-line new-cap
    throw new ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken) {
    throw ApiError.badRequest(
      // eslint-disable-next-line max-len
      'Your account is not activated. Please check your email and activate your account.',
    );
  }

  await generateTokens(res, user);
};

async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);

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
  });
}

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.status(204).end();
};

export const authController = {
  register,
  activation,
  login,
  refresh,
  logout,
  emailSend,
  resetPassword,
};
