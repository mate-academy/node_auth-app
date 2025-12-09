import { db } from '../utils/db.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/tokenService.js';

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Email is not valid';
  }
}

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const existingUser =
    (await db.user.findUnique({
      where: {
        email,
      },
    })) || null;

  if (existingUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const activationToken = uuidv4();

  const hashedPass = await bcrypt.hash(password, 10);

  const newUser = await db.user.create({
    data: {
      email,
      password: hashedPass,
      activationToken,
    },
  });

  await emailService.sendActivationEmail(email, activationToken);

  res.status(201).json(userService.normalize(newUser));
};

const activate = async (req, res) => {
  const { email, activationToken } = req.params;

  const existingUser = await db.user.findFirst({
    where: {
      email,
      activationToken,
    },
  });

  if (!existingUser) {
    res.sendStatus(404);

    return;
  }

  const user = await db.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      activationToken: null,
    },
  });

  res.send(userService.normalize(user));
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('You need activate your account');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

const resetPasswordToken = async (req, res) => {
  const { email } = req.params;

  const errors = {
    email: validateEmail(email),
  };

  if (errors.email) {
    throw ApiError.badRequest('Wrong email', errors);
  }

  const resetPassToken = uuidv4();

  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw ApiError.badRequest('Unknown email', errors);
  }

  const isResetPasswordToken = await db.token.upsert({
    where: {
      userId: user.id,
    },
    update: {
      resetPasswordToken: resetPassToken,
    },
    create: {
      userId: user.id,
      resetPasswordToken: resetPassToken,
    },
  });

  if (!isResetPasswordToken) {
    throw ApiError.badRequest('Something went wrong', errors);
  }

  await emailService.sendResetPasswordEmail(email, resetPassToken);

  res.sendStatus(200);
};

const resetPassword = async (req, res) => {
  const { email, resetToken } = req.params;
  const { password } = req.body;

  if (!email || !resetToken) {
    throw ApiError.badRequest('wrong email or token');
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const tokens = await db.token.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!tokens || tokens.resetPasswordToken !== resetToken) {
    throw ApiError.badRequest('Bad token');
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const updatedUser = await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPass,
    },
  });

  res.send(userService.normalize(updatedUser));
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  resetPasswordToken,
  resetPassword,
};
