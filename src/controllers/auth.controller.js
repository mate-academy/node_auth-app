import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';
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

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(email, hashedPass, name);
  res.send({ message: 'OK' });
};

const activate = async (req, res, next) => {
  try {
    // Беремо токен з параметрів роута
    const { activationToken } = req.params;

    const user = await userService.activate(activationToken);

    const normalizedUser = userService.normalize(user);

    const accessToken = jwtService.sign(normalizedUser);

    const refreshAccessToken = jwtService.signRefresh(normalizedUser);

    await tokenService.save(normalizedUser.id, refreshAccessToken);

    res.cookie('refreshToken', refreshAccessToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Account activated successfully',
      user: normalizedUser,
      accessToken,
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken !== null) {
    throw ApiError.badRequest(
      'If user is not active ask them to activate their email',
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
}

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.unauthorized();
  }

  await generateTokens(res, user);
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw ApiError.badRequest('Email is required');
    }

    await userService.forgotPassword(email);

    return res
      .status(200)
      .json({ message: 'The password reset email has been sent' });
  } catch (e) {
    next(e);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      throw ApiError.badRequest('Password and confirmPassword are required');
    }

    if (newPassword !== confirmPassword) {
      throw ApiError.badRequest('Passwords do not match');
    }

    if (newPassword.length < 6) {
      throw ApiError.badRequest('Password must be at least 6 characters long');
    }

    await userService.resetPassword(resetToken, newPassword);

    return res
      .status(200)
      .json({ message: 'Password has been successfully changed' });
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);
  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
