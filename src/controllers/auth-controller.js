import { sendActivationMail } from '../services/service-mail.js';
import {
  comparePasswords,
  consumeToken,
  createActivationToken,
  createUser,
  findActiveUserByEmail,
  findUserByToken,
} from '../services/users-service.js';
import { ApiError } from '../exeptions/api-error.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from '../services/jwt-serwices.js';
import { tokenSerice } from '../services/tokens-services.js';
import { Token } from '../models/token.js';

async function register(req, res, next) {
  const { email, password } = req.body;
  const EmailErr = validateEmail(email);
  const PasswordErr = validatePassword(password);

  if (EmailErr || PasswordErr) {
    throw ApiError.BadRequest('Bad request', {
      email: EmailErr,
      password: PasswordErr,
    });
  }

  const activationToken = createActivationToken();
  const user = await createUser({ email, password, activationToken });

  await sendActivationMail(email, activationToken);

  res.send(user);
}

async function activate(req, res, next) {
  const { activationToken } = req.params;

  const user = await findUserByToken(activationToken);

  if (!user) {
    throw ApiError.NotFound();
  }

  await consumeToken(user);

  res.send(user);
}

async function login(req, res, next) {
  const { email, password } = req.body;

  const user = await findActiveUserByEmail(email);

  if (!user) {
    throw ApiError.NotFound();
  }

  const comparePass = await comparePasswords(password, user.password);

  if (!comparePass) {
    throw ApiError.Unauthorized();
  }

  return sendAuth(user, res);
}

async function logout(req, res, next) {
  const { refreshToken } = req.cookies;
  const userData = verifyRefreshToken(refreshToken);

  if (userData) {
    await tokenSerice.remove(userData.id)
  }

  res.status(204).send()
}

export async function refresh(req, res, next) {
  const { refreshToken } = req.cookies;

  const userData = verifyRefreshToken(refreshToken);

  if (userData === null) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenSerice.getByToken(refreshToken);
  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await findActiveUserByEmail(userData.email);

  return sendAuth(user, res);
}

async function sendAuth(user, res) {
  const accessToken = createAccessToken({ id: user.id, email: user.email });
  const refreshToken = createRefreshToken({ id: user.id, email: user.email });

  await tokenSerice.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).send({ user: { email: user.email }, accessToken });
}

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
};
