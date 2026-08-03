'use strict';

const { validationResult } = require('express-validator');
const { userService } = require('../services/userService.js');
const { tokenService } = require('../services/tokenService.js');

class AuthController {
  // 1. Реєстрація користувача
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: 'Помилка валідації', errors: errors.array() });
      }

      const { name, email, password } = req.body;
      const userData = await userService.registration(name, email, password);

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  // 2. Вхід у систему з перевіркою активації
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);

      if (userData.user && !userData.user.isActivated) {
        return res.status(400).json({
          message: 'Будь ласка, активуйте вашу електронну пошту для входу',
        });
      }

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  }

  // 3. Вихід із системи
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      if (refreshToken) {
        await tokenService.removeToken(refreshToken);
      }

      res.clearCookie('refreshToken');

      return res.json({ message: 'Успішний вихід' });
    } catch (e) {
      next(e);
    }
  }

  // 4. Активація користувача
  async activate(req, res, next) {
    try {
      const { token } = req.params;

      await userService.activateUser(token);

      return res.json({ message: 'Обліковий запис успішно активовано' });
    } catch (e) {
      next(e);
    }
  }

  // 5. Запит на скидання пароля
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      const result = await userService.requestPasswordReset(email);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  // 6. Скидання пароля за токеном
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

  // 7. Зміна імені (Профіль)
  async changeName(req, res, next) {
    try {
      const userId = req.user.id;
      const { newName } = req.body;
      const updatedUser = await userService.changeName(userId, newName);

      return res.json(updatedUser);
    } catch (e) {
      next(e);
    }
  }

  // 8. Зміна пароля з профілю
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

  // 9. Зміна пошти з профілю
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
