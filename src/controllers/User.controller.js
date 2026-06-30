/* eslint-disable no-console */
'use strict';

const { UserService } = require('../services/user.service');
const { jwt } = require('../utils/jwt');

const userController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: "Усі поля (name, email, password) є обов'язковими" });
      }

      const newUser = await UserService.register(name, email, password);

      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  activation: async (req, res) => {
    try {
      const { email, token } = req.params;

      console.log('--- RAW ACTIVATION ---');
      console.log('Email in URL:', email);
      console.log('Token in URL:', token);

      const user = await UserService.findByEmail(email);

      if (!user) {
        return res.status(404).json({ error: 'Користувача не знайдено' });
      }

      console.log('Token in DB:', user.activationToken);
      console.log('Are tokens equal?', user.activationToken === token);
      console.log('Length in DB:', user.activationToken?.length);
      console.log('Length in URL:', token?.length);

      if (user.activationToken !== token) {
        return res.status(404).json({ error: 'Невалідний токен' });
      }

      await UserService.activation(email, token);

      return res.status(200).json({ message: 'Акаунт успішно активовано' });
    } catch (error) {
      console.error('SERVER ERROR:', error);

      return res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Введіть всі поля' });
      }

      const user = await UserService.login(email, password);

      if (!user) {
        return res.status(404).json({ error: 'Помилка під час авторизації' });
      }

      const normalizedUser = UserService.normalize(user);
      const refreshToken = jwt.generateRefreshToken(normalizedUser);

      await UserService.saveToken(user.id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.status(200).json({
        user: normalizedUser,
        accessToken: jwt.generateAccessToken(normalizedUser),
      });
    } catch (error) {
      return res
        .status(401)
        .json({ error: error.message || 'Помилка під час авторизації' });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      await UserService.forgotPassword(email);

      return res.status(200).json({ message: 'Лист надіслано' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        name,
        oldPassword,
        newPassword,
        confirmation,
        newEmail,
        password,
      } = req.body;

      if (name) {
        await UserService.updateName(userId, name);

        return res.json({ message: 'Ім’я успішно оновлено' });
      }

      if (oldPassword && newPassword && confirmation) {
        if (newPassword !== confirmation) {
          return res.status(400).json({ error: 'Паролі не збігаються' });
        }

        await UserService.updatePassword(userId, oldPassword, newPassword);

        return res.json({ message: 'Пароль успішно оновлено' });
      }

      if (newEmail && password) {
        await UserService.updateEmail(
          userId,
          req.user.email,
          newEmail,
          password,
        );

        return res.json({
          message: 'Пошту змінено, сповіщення надіслано на стару адресу',
        });
      }

      return res.status(400).json({ error: 'Немає даних для оновлення' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Token is required' });
      }

      const user = await UserService.refresh(refreshToken);
      const normalizedUser = UserService.normalize(user);

      const newRefreshToken = jwt.generateRefreshToken(normalizedUser);

      await UserService.saveToken(user.id, newRefreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.status(200).json({
        user: normalizedUser,
        accessToken: jwt.generateAccessToken(normalizedUser),
      });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, password, confirmation } = req.body;

      if (password !== confirmation) {
        return res.status(400).json({ error: 'Паролі не збігаються' });
      }

      await UserService.resetPassword(token, password);

      return res.status(200).json({ message: 'Пароль успішно змінено' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};

module.exports = {
  userController,
};
