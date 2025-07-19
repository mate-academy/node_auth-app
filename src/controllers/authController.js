'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const UserModel = require('../models/User');
const EmailService = require('../utils/email');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      const { name, email, password } = req.body;

      const existingUser = UserModel.findByEmail(email);

      if (existingUser) {
        return res.status(400).json({
          error: 'User with this email already exists',
        });
      }

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = UserModel.createUser({
        name,
        email,
        password: hashedPassword,
      });

      const activationToken = uuidv4();

      UserModel.setActivationToken(activationToken, newUser.id);

      const activationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/activate/${activationToken}`;

      await EmailService.sendActivationEmail(email, name, activationUrl);

      res.status(201).json({
        message: `User registered successfully. Please check your email to activate your account.`,
        userId: newUser.id,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      const { email, password } = req.body;

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const user = UserModel.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          error: 'Invalid email or password',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid email or password',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          error:
            'Please activate your account by clicking the link in your email',
        });
      }

      const authToken = uuidv4();

      UserModel.updateUser(user.id, { authToken });

      res.json({
        message: 'Login successful',
        token: authToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async logout(req, res) {
    try {
      UserModel.updateUser(req.user.id, { authToken: null });

      res.json({ message: 'Logout successful' });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async activate(req, res) {
    try {
      const token = req.params.token;
      const userId = UserModel.getActivationToken(token);

      if (!userId) {
        return res.status(400).json({
          error: 'Invalid activation link',
          message: 'The activation link is invalid or has expired.',
        });
      }

      const user = UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message:
            'The user associated with this activation link was not found.',
        });
      }

      if (user.isActive) {
        return res.status(400).json({
          error: 'Already activated',
          message: 'This account is already activated.',
        });
      }

      UserModel.activateUser(userId);
      UserModel.deleteActivationToken(token);

      const authToken = uuidv4();

      UserModel.updateUser(user.id, { authToken });

      res.json({
        message: 'Account activated successfully',
        token: authToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Activation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      const { email } = req.body;

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const user = UserModel.findByEmail(email);

      if (user) {
        const resetToken = uuidv4();

        UserModel.setResetToken(resetToken, {
          userId: user.id,
          expires: Date.now() + 3600000, // 1 hour
        });

        const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        await EmailService.sendPasswordResetEmail(email, user.name, resetUrl);
      }

      res.json({
        message: `If an account with that email exists, we've sent a password reset link.`,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async resetPassword(req, res) {
    try {
      const token = req.params.token;
      const resetData = UserModel.getResetToken(token);
      const errors = validationResult(req);

      if (!resetData || resetData.expires < Date.now()) {
        return res.status(400).json({
          error: 'Invalid reset link',
          message: 'The password reset link is invalid or has expired.',
        });
      }

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const user = UserModel.findById(resetData.userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'The user associated with this reset link was not found.',
        });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 12);

      UserModel.updateUser(user.id, { password: hashedPassword });
      UserModel.deleteResetToken(token);

      res.json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AuthController();
