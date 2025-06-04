/* eslint-disable max-len */

const {
  createUser,
  findUserByEmail,
  findUserByActivationToken,
  findUserByResetToken,
  activateUser,
  setResetToken,
  resetPassword,
} = require('../services/userService');
const {
  generateTokens,
  refreshTokens,
  removeAllUserTokens,
} = require('../services/tokenService');
const {
  sendActivationEmail,
  sendPasswordResetEmail,
} = require('../services/emailService');
const { comparePassword } = require('../utils/password');
const { setTokenCookies, clearTokenCookies } = require('../utils/cookie');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const user = await createUser({ name, email, password });

    await sendActivationEmail(user.email, user.activationToken);

    res.status(201).json({
      success: true,
      message:
        'Registration successful. Please check your email to activate your account.',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

const activate = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await findUserByActivationToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired activation token',
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is already activated',
        redirect: '/login',
      });
    }

    const activatedUser = await activateUser(token);
    const tokens = await generateTokens(activatedUser);

    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      message: 'Account activated successfully',
      redirect: '/profile',
      data: {
        id: activatedUser.id,
        name: activatedUser.name,
        email: activatedUser.email,
        isActive: activatedUser.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message:
          'Please activate your account first. Check your email for activation link.',
        redirect: '/activate',
      });
    }

    const tokens = await generateTokens(user);

    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      redirect: '/profile',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await removeAllUserTokens(req.user.id);
    }

    clearTokenCookies(res);

    res.json({
      success: true,
      message: 'Logout successful',
      redirect: '/login',
    });
  } catch (error) {
    next(error);
  }
};

const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
    }

    await setResetToken(email);
    await sendPasswordResetEmail(user.email, user.resetToken);

    res.json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

const confirmPasswordReset = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await findUserByResetToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    await resetPassword(token, password);

    res.json({
      success: true,
      message: 'Password reset successful',
      redirect: '/login',
    });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    const tokens = await refreshTokens(refreshToken);

    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
    });
  } catch (error) {
    clearTokenCookies(res);

    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      redirect: '/login',
    });
  }
};

module.exports = {
  register,
  activate,
  login,
  logout,
  requestPasswordReset,
  confirmPasswordReset,
  refreshAccessToken,
};
