const { validationResult } = require('express-validator');
const { userService } = require('../services/userService.js');

class AuthController {
  // 1. Реєстрація користувача
  async registration(req, res, next) {
    try {
      // Перевіряємо помилки валідації (з express-validator)
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: 'Помилка валідації', errors: errors.array() });
      }

      const { email, password } = req.body;
      const userData = await userService.registration(email, password);

      // Записуємо refreshToken у httpOnly cookie на 30 днів
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true, // Захист від XSS
      });

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  // 2. Вхід у систему
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);

      // Записуємо новий refreshToken у куку
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
      // Очищаємо куку при виході
      res.clearCookie('refreshToken');
      return res.json({ message: 'Успішний вихід' });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = {
  authController: new AuthController(),
};
