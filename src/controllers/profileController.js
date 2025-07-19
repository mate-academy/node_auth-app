'use strict';

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const UserModel = require('../models/User');
const EmailService = require('../utils/email');

class ProfileController {
  async getProfile(req, res) {
    try {
      const { user } = req;

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateName(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { name } = req.body;

      UserModel.updateUser(req.user.id, { name });

      res.json({
        message: 'Name updated successfully',
        user: {
          id: req.user.id,
          name,
          email: req.user.email,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Update name error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      const { oldPassword, newPassword } = req.body;

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        req.user.password,
      );

      if (!isOldPasswordValid) {
        return res.status(400).json({
          error: 'Current password is incorrect',
        });
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      UserModel.updateUser(req.user.id, { password: hashedPassword });

      res.json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async changeEmail(req, res) {
    try {
      const errors = validationResult(req);
      const { password, newEmail } = req.body;

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      // Check if email already exists
      const existingUser = UserModel.findByEmail(newEmail);

      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({
          error: 'This email is already in use',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, req.user.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          error: 'Password is incorrect',
        });
      }

      await EmailService.sendEmailChangeNotification(
        req.user.email,
        req.user.name,
        req.user.email,
        newEmail,
      );

      UserModel.updateUser(req.user.id, { email: newEmail });

      res.json({
        message: `Email changed successfully. A notification has been sent to your old email.`,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: newEmail,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Change email error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ProfileController();
