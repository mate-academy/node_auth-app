import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

function validateEmail(email) {
  if (!email) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  if (!passwordPattern.test(password)) {
    return (
      'Password must contain minimum 8 characters, 1 uppercase letter, ' +
      '1 lowercase letter and one number'
    );
  }
}

async function register(request, response, next) {
  const { name, email, password } = request.body;

  if (!name) {
    throw ApiError.badRequest('Name is required');
  }

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPassword);

  response.send({ message: 'OK' });
}

async function activate(request, response) {
  const { activationToken } = request.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    response.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  response.send(userService.normalize(user));
}

async function login(request, response) {
  const { email, password } = request.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.activationToken) {
    throw ApiError.forbidden('Please activate your email before logging in');
  }

  await generateTokens(response, user);
}

async function refresh(request, response) {
  const { refreshToken } = request.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(response, user);
}

async function generateTokens(response, user) {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  response.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  response.send({
    user: normalizedUser,
    accessToken,
  });
}

async function logout(request, response) {
  const { refreshToken } = request.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  response.sendStatus(204);
}

async function resetPasswordRequest(request, response) {
  const { email } = request.body;

  if (!email) {
    throw ApiError.badRequest('Email is required');
  }

  await userService.resetPasswordRequest(email);

  response.send({
    message: 'Check your email for reset password instructions',
  });
}

async function resetPassword(request, response) {
  const { resetToken } = request.params;
  const { password, confirmation } = request.body;

  if (!password || !confirmation) {
    throw ApiError.badRequest('Password and confirmation are required');
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords do not match', {
      confirmation: 'Passwords do not match',
    });
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    throw ApiError.badRequest('Invalid password', { password: passwordError });
  }

  await userService.resetPassword(resetToken, password);

  response.send({ message: 'Password reset successfully' });
}

async function confirmNewEmail(request, response) {
  const { newEmailToken } = request.params;

  const user = await userService.confirmEmailChange(newEmailToken);

  response.send({
    message: 'Email confirmed',
    user: userService.normalize(user),
  });
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetPasswordRequest,
  resetPassword,
  confirmNewEmail,
};
