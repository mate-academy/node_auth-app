import { User } from '../models/user.js';
import { jwtService } from '../services/jwt.service.js';
import { emailService } from '../services/email.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from './token.service.js';
import { TOKEN_TYPES } from '../models/token.js';

const TIME = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
};

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function normalize({ name, email, id, createdAt }) {
  return {
    id,
    name,
    email,
    createdAt,
  };
}

async function register({ name, email, password }) {
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User is already exist', {
      email: 'User is already exist',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const activationToken = jwtService.sign({ email, userId: user.id }, '24h');

  await tokenService.createToken({
    userId: user.id,
    type: TOKEN_TYPES.ACTIVATION,
    token: activationToken,
    expiresIn: TIME.DAY,
  });

  await emailService.sendActivationMail(email, activationToken);
}

async function login({ email, password }) {
  const user = await findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw ApiError.unauthorized({
      email: 'Incorrect credentials',
      password: 'Incorrect credentials',
    });
  }

  const hasActiveActivationToken = await tokenService.hasActiveToken(
    user.id,
    TOKEN_TYPES.ACTIVATION,
  );

  if (hasActiveActivationToken) {
    throw ApiError.unauthorized({ email: 'Activate your email first' });
  }

  return user;
}

async function activate(activationToken) {
  const isValidJwt = jwtService.verify(activationToken);

  if (!isValidJwt) {
    throw ApiError.badRequest('Token invalid', {
      activationToken: 'Token invalid or expired',
    });
  }

  const tokenData = await tokenService.findTokenWithUser(
    activationToken,
    TOKEN_TYPES.ACTIVATION,
  );

  if (!tokenData) {
    throw ApiError.notFound({ activationToken: 'Token not found' });
  }

  await tokenService.markAsUsed(tokenData.id);
}

async function refresh(refreshToken) {
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const tokenData = await tokenService.findByToken(
    refreshToken,
    TOKEN_TYPES.REFRESH,
  );

  if (!tokenData || tokenData.expireAt < new Date()) {
    if (tokenData) {
      await tokenService.markAsUsed(tokenData.id);
    }
    throw ApiError.unauthorized();
  }

  const user = await findByEmail(userData.email);

  if (!user) {
    throw ApiError.unauthorized();
  }

  await tokenService.markAsUsed(tokenData.id);

  return user;
}

async function sendResetPassword(email) {
  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  await tokenService.invalidateTokensByType(
    user.id,
    TOKEN_TYPES.RESET_PASSWORD,
  );

  const resetToken = jwtService.signReset({ email: user.email });

  await tokenService.createToken({
    userId: user.id,
    type: TOKEN_TYPES.RESET_PASSWORD,
    token: resetToken,
    expiresIn: 10 * TIME.MINUTE,
  });

  await emailService.sendResetPasswordMail(user.email, resetToken);
}

async function resetPassword(resetPassToken) {
  if (!resetPassToken) {
    throw ApiError.badRequest('Bad request');
  }

  const tokenData = await tokenService.findTokenWithUser(
    resetPassToken,
    TOKEN_TYPES.RESET_PASSWORD,
  );

  if (!tokenData) {
    throw ApiError.badRequest('Invalid token');
  }

  const isValidJwt = jwtService.verifyReset(resetPassToken);
  const isExpired = tokenData.expireAt < new Date();

  if (!isValidJwt || isExpired) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  return tokenData.User;
}

async function setPassword({ password, confirmation, resetPassToken }) {
  if (password !== confirmation) {
    throw ApiError.badRequest('Invalid data', {
      password: 'Confirmation and password must be equal',
    });
  }

  const tokenData = await tokenService.findTokenWithUser(
    resetPassToken,
    TOKEN_TYPES.RESET_PASSWORD,
  );

  if (!tokenData) {
    throw ApiError.badRequest('Invalid token');
  }

  const isValidJwt = jwtService.verifyReset(resetPassToken);
  const isExpired = tokenData.expireAt < new Date();

  if (!isValidJwt || isExpired) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  tokenData.User.password = hashedPassword;
  await tokenData.User.save();

  await tokenService.markAsUsed(tokenData.id);
}

async function logout(refreshToken) {
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.invalidateTokensByType(userData.id, TOKEN_TYPES.REFRESH);
}

async function generateTokens(res, user) {
  const normalizeUser = normalize(user);

  const accessToken = jwtService.sign(normalizeUser);
  const refreshToken = jwtService.signRefresh(normalizeUser);

  await tokenService.invalidateTokensByType(
    normalizeUser.id,
    TOKEN_TYPES.REFRESH,
  );

  await tokenService.createToken({
    userId: normalizeUser.id,
    type: TOKEN_TYPES.REFRESH,
    token: refreshToken,
    expiresIn: TIME.MONTH,
  });

  res.cookie('refreshToken', refreshToken, {
    maxAge: TIME.MONTH,
    httpOnly: true,
    secure: true,
  });

  return {
    user: normalizeUser,
    accessToken,
  };
}

async function getProfile(refreshToken) {
  const isValidToken = jwtService.verifyRefresh(refreshToken);

  if (!isValidToken) {
    throw ApiError.unauthorized();
  }

  const tokenData = await tokenService.findByToken(
    refreshToken,
    TOKEN_TYPES.REFRESH,
  );

  if (!tokenData || tokenData.expireAt < new Date()) {
    throw ApiError.unauthorized();
  }

  const user = await User.findByPk(tokenData.userId);

  if (!user) {
    throw ApiError.unauthorized();
  }

  return user;
}

async function nameUpdate({ refreshToken, name }) {
  const user = await getProfile(refreshToken);

  user.name = name;
  await user.save();
}

async function passwordUpdate({
  refreshToken,
  password,
  newPassword,
  confirmPassword,
}) {
  const user = await getProfile(refreshToken);

  if (!(await bcrypt.compare(password, user.password))) {
    throw ApiError.badRequest('Wrong password');
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Confirmation and password must be equal');
  }

  if (await bcrypt.compare(newPassword, user.password)) {
    throw ApiError.badRequest(
      'New password must be different from old password',
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();
}

async function emailUpdate({ refreshToken, password, newEmail, confirmEmail }) {
  const user = await getProfile(refreshToken);
  const isUsedEmail = await findByEmail(newEmail);

  if (isUsedEmail) {
    throw ApiError.badRequest('Email is already in use');
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw ApiError.badRequest('Wrong password');
  }

  if (newEmail !== confirmEmail) {
    throw ApiError.badRequest('Email confirmation does not match');
  }

  if (newEmail === user.email) {
    throw ApiError.badRequest('New email must be different from old email');
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  const html = `
  <h1>Your email ${oldEmail} has been changed to ${newEmail}</h1>`;

  await emailService.send({
    email: oldEmail,
    subject: 'Your email has been changed',
    html,
  });
}

export const userService = {
  findByEmail,
  normalize,
  register,
  login,
  activate,
  generateTokens,
  refresh,
  logout,
  sendResetPassword,
  resetPassword,
  setPassword,
  nameUpdate,
  passwordUpdate,
  emailUpdate,
  getProfile,
};
