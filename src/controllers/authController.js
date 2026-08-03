'use strict';

const { userService } = require('../services/userService');

class AuthController {
  async registration(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const userData = await userService.registration(name, email, password);

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      return res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const { token } = req.params;

      await userService.activateUser(token);

      return res.json({ message: 'Акаунт успішно активовано' });
    } catch (e) {
      next(e);
    }
  }

  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      const result = await userService.requestPasswordReset(email);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
      const result = await userService.resetPassword(token, newPassword);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async changeName(req, res, next) {
    try {
      const userId = req.user.id;
      const { name } = req.body;
      const updatedUser = await userService.changeName(userId, name);

      return res.json(updatedUser);
    } catch (e) {
      next(e);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;
      const result = await userService.changePassword(
        userId,
        oldPassword,
        newPassword,
      );

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async changeEmail(req, res, next) {
    try {
      const userId = req.user.id;
      const { password, newEmail } = req.body;
      const result = await userService.changeEmail(userId, password, newEmail);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = {
  authController: new AuthController(),
};
