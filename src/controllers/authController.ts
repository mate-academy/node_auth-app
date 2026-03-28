import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { userService } from '../services/userService.js';
import { ApiError } from '../exceptions/ApiError.js';
import { validationUtil } from '../utils/validation.js';
import { tokenService } from '../services/tokenService.js';

async function register(
  request: ExpressRequest,
  response: ExpressResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  try {
    const { email, password, name } = request.body;

    const errors = {
      email: validationUtil.validateEmail(email),
      password: validationUtil.validatePassword(password),
    };

    if (errors.email || errors.password) {
      return response.render('register', {
        error: errors.email || errors.password,
      });
    }

    await userService.register({ email, password, name });

    response.render('message', {
      text: 'User registered. Please check your email.',
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Registration failed';

    response.render('register', { error: errorMessage });
  }
}

async function activate(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const { email, activationToken } = request.params;

    await userService.activation({
      email: String(email),
      activationToken: String(activationToken),
    });

    const user = await userService.getByEmail(String(email));

    if (!user) {
      throw ApiError.NotFound();
    }

    const normalizedUser = userService.normalize(user);

    const refreshToken = tokenService.generateRefreshToken(normalizedUser);

    await tokenService.saveToken(user.id, refreshToken);

    response.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    response.redirect('/user/profile');
  } catch (error) {
    next(error);
  }
}

async function login(
  request: ExpressRequest,
  response: ExpressResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  try {
    const { email, password } = request.body;

    const user = await userService.login({ email, password });
    const refreshToken = tokenService.generateRefreshToken(user);

    await tokenService.saveToken(user.id, refreshToken);

    response.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    response.redirect('/user/profile');
  } catch (error) {
    response.render('login', {
      error: error instanceof Error ? error.message : 'Login failed',
    });
  }
}

async function logout(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const { refreshToken } = request.cookies;

    await tokenService.removeToken(refreshToken);

    response.clearCookie('refreshToken');
    response.redirect('/auth/login');
  } catch (error) {
    next(error);
  }
}

async function resetPasswordRequest(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const { email } = request.body;

    await userService.resetPassword({ email });

    response.render('message', {
      text: 'Password reset link sent to your email.',
    });
  } catch (error) {
    next(error);
  }
}

async function resetPasswordConfirm(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const { email, password, resetPasswordToken, confirmation } = request.body;

    if (password !== confirmation) {
      return response.render('reset-password', {
        error: 'Passwords do not match',
        email,
        token: resetPasswordToken,
      });
    }

    await userService.confirmResetPassword({
      email,
      password,
      resetPasswordToken,
    });

    response.render('message', { text: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}

async function renderRegister(
  request: ExpressRequest,
  response: ExpressResponse,
) {
  response.render('register', { error: null });
}

async function renderLogin(request: ExpressRequest, response: ExpressResponse) {
  response.render('login', { error: null });
}

async function renderResetPasswordRequest(
  request: ExpressRequest,
  response: ExpressResponse,
) {
  response.render('reset-password-request', { error: null });
}

async function renderResetPasswordConfirm(
  request: ExpressRequest,
  response: ExpressResponse,
) {
  const { email, resetPasswordToken } = request.params;

  response.render('reset-password', {
    email,
    token: resetPasswordToken,
    error: null,
  });
}

export const authController = {
  register,
  activate,
  login,
  logout,
  resetPasswordRequest,
  resetPasswordConfirm,
  renderRegister,
  renderLogin,
  renderResetPasswordRequest,
  renderResetPasswordConfirm,
};
