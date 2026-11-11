import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation';
import { ApiError } from '../exceptions/ApiError';
import { userService } from '../services/user.service';
import { User } from '../generated/prisma/client';
import { jwtService } from '../services/jwt.service';
import { tokenService } from '../services/token.service';
import { cookieOptions, REFRESH_COOKIE } from '../utils/cookies';

async function sendAuthentication(res: Response, user: User) {
  const userData = userService.normalize(user);
  const payload = { id: user.id, email: user.email };

  const accessToken = jwtService.signAccess(payload);
  const refreshToken = jwtService.signRefresh(payload);

  await tokenService.save(user.id, refreshToken);

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);

  res.json({ user: userData, accessToken });
}

async function activate(
  req: Request<{ activationToken: string }>,
  res: Response,
) {
  const user = await userService.activate(req.params.activationToken);

  await sendAuthentication(res, user);
}

async function register(req: Request, res: Response) {
  const { name, email, password } = req.body ?? {};

  const errors: Record<string, string> = {};

  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (nameError) {
    errors.name = nameError;
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  if (Object.keys(errors).length) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await userService.register(
    name.trim(),
    email.trim().toLowerCase(),
    password,
  );

  res.status(201).json({
    message: 'Check your email to activate your account',
    user,
  });
}

async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await userService.findByEmail(email.trim().toLowerCase());
  const isPasswordValid = user
    ? await bcrypt.compare(password, user.password)
    : false;

  if (!user || !isPasswordValid) {
    throw ApiError.badRequest('Invalid email or password');
  }

  if (user.activationToken) {
    throw ApiError.forbidden('Please activate your email first');
  }

  await sendAuthentication(res, user);
}

async function refresh(req: Request, res: Response) {
  const refreshToken: string | undefined = req.cookies?.[REFRESH_COOKIE];

  const payload = refreshToken ? jwtService.verifyRefresh(refreshToken) : null;
  const tokenInDb = refreshToken
    ? await tokenService.findByToken(refreshToken)
    : null;

  if (!refreshToken || !payload || !tokenInDb) {
    res.clearCookie(REFRESH_COOKIE, cookieOptions);
    throw ApiError.unauthorized();
  }

  const user = await userService.findById(payload.id);

  if (!user) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(refreshToken);
  await sendAuthentication(res, user);
}

async function logout(req: Request, res: Response) {
  const refreshToken: string | undefined = req.cookies?.[REFRESH_COOKIE];

  if (refreshToken) {
    await tokenService.remove(refreshToken);
  }

  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  res.sendStatus(204);
}

async function requestPasswordReset(req: Request, res: Response) {
  const { email } = req.body ?? {};
  const emailError = validateEmail(email);

  if (emailError) {
    throw ApiError.badRequest('Validation error', { email: emailError });
  }

  await userService.requestPasswordReset(email.trim().toLowerCase());

  res.json({
    message: 'If this email is registered, we have sent a reset link',
  });
}

async function resetPassword(
  req: Request<{ resetToken: string }>,
  res: Response,
) {
  const { password, confirmation } = req.body ?? {};
  const errors: Record<string, string> = {};

  const passwordError = validatePassword(password);

  if (passwordError) {
    errors.password = passwordError;
  }

  if (password !== confirmation) {
    errors.confirmation = 'Passwords do not match';
  }

  if (Object.keys(errors).length) {
    throw ApiError.badRequest('Validation error', errors);
  }

  await userService.resetPassword(req.params.resetToken, password);

  res.json({ message: 'Password has been changed' });
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
};
