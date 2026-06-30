'use strict';

const { mailer } = require('../utils/mailer');
const { User } = require('../models/UserModel');
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');

const UserService = {
  register: async (name, email, password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(password)) {
      throw new Error(
        'Пароль має бути не менше 8 символів, мати по одній літері або цифрі',
      );
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw new Error('User is already using this email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = uuid();

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      activationToken,
    });

    await mailer.sendActivationLink(email, activationToken);

    return newUser;
  },

  activation: async (email, activationToken) => {
    const user = await User.findOne({ where: { email, activationToken } });

    if (!user) {
      throw new Error('Невалідний лінк або акаунт вже активовано');
    }

    await User.update(
      { activationToken: null, isActive: true },
      { where: { email } },
    );

    return user;
  },

  findByEmail: async (email) => {
    const user = await User.findOne({ where: { email } });

    return user;
  },

  login: async (email, password) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("Can't find user");
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      throw new Error('Невірний пароль');
    }

    if (!user.isActive) {
      throw new Error('Акаунт не активовано. Перевірте пошту');
    }

    return user;
  },

  saveToken: async (userId, refreshToken) => {
    const savedToken = await User.update(
      { refreshToken },
      { where: { id: userId } },
    );

    return savedToken;
  },

  removeToken: async (refreshToken) => {
    const removedToken = await User.update(
      { refreshToken: null },
      { where: { refreshToken } },
    );

    return removedToken;
  },

  findToken: async (refreshToken) => {
    const user = await User.findOne({ where: { refreshToken } });

    return user;
  },

  refresh: async (refreshToken) => {
    if (!refreshToken) {
      throw new Error('Token is required');
    }

    const userData =
      require('../utils/jwt').jwt.validateRefreshToken(refreshToken);
    const user = await UserService.findToken(refreshToken);

    if (!userData || !user) {
      throw new Error('Invalid or expired token');
    }

    return user;
  },

  forgotPassword: async (email) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Користувача не знайдено');
    }

    const resetToken = uuid();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await User.update(
      { resetPasswordToken: resetToken, resetPasswordExpires: expires },
      { where: { email } },
    );

    const resetLink = `${process.env.CLIENT_URL}/#/auth/reset-password/${resetToken}`;

    await mailer.send(
      email,
      'Password reset',
      `<h1>Reset link:</h1><a href="${resetLink}">${resetLink}</a>`,
    );
  },

  resetPassword: async (token, newPassword) => {
    const { Op } = require('sequelize');
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new Error('Токен невалідний або застарів');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
      { where: { id: user.id } },
    );
  },

  updateName: async (userId, newName) => {
    const upUser = await User.update(
      { name: newName },
      { where: { id: userId } },
    );

    return upUser;
  },

  updatePassword: async (userId, oldPassword, newPassword) => {
    const user = await User.findByPk(userId);

    const isCorrectPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isCorrectPassword) {
      throw new Error('Невірний старий пароль');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const upUser = await User.update(
      { password: hashedPassword },
      { where: { id: userId } },
    );

    return upUser;
  },

  updateEmail: async (userId, currentEmail, newEmail, password) => {
    const user = await User.findByPk(userId);

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      throw new Error('Невірний пароль');
    }

    await mailer.send(
      currentEmail,
      'Зміна поштової адреси',
      `Your account email is being changed to ${newEmail}. If it wasn't you, contact support.`,
    );

    const upUser = await User.update(
      { email: newEmail },
      { where: { id: userId } },
    );

    return upUser;
  },

  normalize: (user) => {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
    };
  },
};

module.exports = {
  UserService,
};
