'use strict';

const nodeCrypto = require('crypto');
const bcrypt = require('bcrypt');
const { usersRepository } = require('../entity/users.repository');
const { sendEmail } = require('../utils/email');
const {
  PASSWORD_RULES_MESSAGE,
  isPasswordValid,
} = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    if (!isPasswordValid(password)) {
      return res.status(400).json({
        message: PASSWORD_RULES_MESSAGE,
      });
    }

    const existingUser = await usersRepository.getByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = nodeCrypto.randomBytes(24).toString('hex');

    const user = await usersRepository.create(
      name,
      email,
      hashedPassword,
      activationToken,
    );

    await sendEmail({
      to: email,
      subject: 'Activate your account',
      text:
        'Welcome to Auth App.\n\n' +
        `Use this activation token to activate your account: ${activationToken}`,
    });

    return res.status(201).json({
      message: `User created. Password rules: ${PASSWORD_RULES_MESSAGE}`,
      activationEmailSent: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function activate(req, res) {
  try {
    const { email, activationToken } = req.body;

    if (!email || !activationToken) {
      return res.status(400).json({
        message: 'Email and activationToken are required',
      });
    }

    const user = await usersRepository.getByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.activationToken !== activationToken) {
      return res.status(400).json({
        message: 'Invalid activation token',
      });
    }

    await usersRepository.activate(email);

    const activatedUser = await usersRepository.getByEmail(email);
    const accessToken = generateAccessToken(activatedUser);
    const refreshToken = generateRefreshToken(activatedUser);

    return res.status(200).json({
      message: 'Account activated successfully',
      redirectTo: '/profile',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const user = await usersRepository.getByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: 'Invalid password',
      });
    }

    if (user.activationToken !== null) {
      return res.status(403).json({
        message: 'Please activate your email',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).json({
      message: 'Login successful',
      redirectTo: '/profile',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function logout(req, res) {
  return res.status(200).json({
    message: 'Logout successful',
    redirectTo: '/auth/login',
  });
}

async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const user = await usersRepository.getByEmail(email);

    if (user) {
      const resetToken = nodeCrypto.randomBytes(24).toString('hex');

      await usersRepository.saveResetToken(email, resetToken);

      await sendEmail({
        to: email,
        subject: 'Reset your password',
        text:
          'We received a password reset request.\n\n' +
          `Use this reset token to continue: ${resetToken}`,
      });
    }

    return res.status(200).json({
      message: 'If this email exists, a reset email has been sent',
      redirectTo: '/auth/password-reset/sent',
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function confirmPasswordReset(req, res) {
  try {
    const { resetToken, password, confirmation } = req.body;

    if (!resetToken || !password || !confirmation) {
      return res.status(400).json({
        message: 'Reset token, password and confirmation are required',
      });
    }

    if (password !== confirmation) {
      return res.status(400).json({
        message: 'Password confirmation must match password',
      });
    }

    if (!isPasswordValid(password)) {
      return res.status(400).json({
        message: PASSWORD_RULES_MESSAGE,
      });
    }

    const user = await usersRepository.getByResetToken(resetToken);

    if (!user) {
      return res.status(404).json({
        message: 'Invalid reset token',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersRepository.updatePassword(user.id, hashedPassword);

    return res.status(200).json({
      message: 'Password reset successful',
      redirectTo: '/auth/password-reset/success',
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function getResetEmailSentPage(req, res) {
  return res.status(200).json({
    message: 'Reset password email sent page',
  });
}

async function getResetSuccessPage(req, res) {
  return res.status(200).json({
    message: 'Password reset success page',
    loginLink: '/auth/login',
    redirectTo: '/auth/login',
  });
}

module.exports = {
  authController: {
    register,
    activate,
    login,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    getResetEmailSentPage,
    getResetSuccessPage,
  },
};
