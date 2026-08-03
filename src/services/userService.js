'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User, Token } = require('../models');
const { mailService } = require('./mailService');
const { tokenService } = require('./tokenService');

class UserService {
  async registration(name, email, password) {
    // 1. Перевіряємо, чи існує користувач
    const candidate = await User.findOne({ where: { email } });

    if (candidate) {
      throw new Error(`Користувач з поштою ${email} вже існує`);
    }

    // 2. Хешуємо пароль
    const hashPassword = await bcrypt.hash(password, 3);

    // eslint-disable-next-line max-len
    // 3. Створюємо користувача в БД (використовуємо passwordHash згідно з моделю)
    const user = await User.create({
      name,
      email,
      passwordHash: hashPassword,
    });

    // 4. Створюємо токен активації та відправляємо лист
    const activationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 години

    await Token.create({
      userId: user.id,
      token: activationToken,
      type: 'activation',
      expiresAt,
    });

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationToken}`,
    );

    // 5. Формуємо DTO і ґенеруємо токени
    const userDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      isActivated: user.isActivated,
    };

    const tokens = tokenService.generateTokens({ ...userDto });

    // 6. Зберігаємо refreshToken у базу
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async login(email, password) {
    // 1. Шукаємо користувача в БД
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error(`Користувача з поштою ${email} не знайдено`);
    }

    // 2. Перевіряємо, чи збігається пароль (з полем passwordHash)
    const isEquals = await bcrypt.compare(password, user.passwordHash);

    if (!isEquals) {
      throw new Error('Невірний пароль');
    }

    // 3. Перевіряємо, чи активований обліковий запис
    if (!user.isActivated) {
      throw new Error(
        'Будь ласка, активуйте ваш обліковий запис за посиланням у листі',
      );
    }

    // Формуємо payload та ґенеруємо нові токени
    const userDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      isActivated: user.isActivated,
    };
    const tokens = tokenService.generateTokens({ ...userDto });

    // 4. Оновлюємо refreshToken у БД
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async activateUser(token) {
    const tokenData = await Token.findOne({
      where: { token, type: 'activation' },
    });

    if (!tokenData) {
      throw new Error('Некоректний або прострочений токен активації');
    }

    // Додаємо захист від використання простроченого токена активації
    if (tokenData.expiresAt < new Date()) {
      throw new Error('Activation token expired');
    }

    const user = await User.findByPk(tokenData.userId);

    if (!user) {
      throw new Error('Користувача не знайдено');
    }

    user.isActivated = true;
    await user.save();

    await tokenData.destroy();

    return user;
  }

  async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error(`Користувача з поштою ${email} не знайдено`);
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 година

    await Token.create({
      userId: user.id,
      token: resetToken,
      type: 'reset',
      expiresAt,
    });

    await mailService.sendPasswordResetMail(
      email,
      `${process.env.API_URL}/api/reset-password/${resetToken}`,
    );

    return { message: 'Лист для скидання пароля надіслано' };
  }

  async resetPassword(token, newPassword) {
    const tokenData = await Token.findOne({ where: { token, type: 'reset' } });

    if (!tokenData) {
      throw new Error('Некоректний або прострочений токен скидання пароля');
    }

    // Перевірка терміну дії токена скидання пароля
    if (tokenData.expiresAt < new Date()) {
      throw new Error('Reset token expired');
    }

    const user = await User.findByPk(tokenData.userId);

    if (!user) {
      throw new Error('Користувача не знайдено');
    }

    const hashPassword = await bcrypt.hash(newPassword, 3);

    user.passwordHash = hashPassword;
    await user.save();

    await tokenData.destroy();

    return { message: 'Пароль успішно змінено' };
  }

  async changeName(userId, newName) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('Користувача не знайдено');
    }

    user.name = newName;
    await user.save();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActivated: user.isActivated,
    };
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('Користувача не знайдено');
    }

    const isEquals = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isEquals) {
      throw new Error('Невірний старий пароль');
    }

    const hashPassword = await bcrypt.hash(newPassword, 3);

    user.passwordHash = hashPassword;
    await user.save();

    return { message: 'Пароль успішно оновлено' };
  }

  async changeEmail(userId, password, newEmail) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('Користувача не знайдено');
    }

    const isEquals = await bcrypt.compare(password, user.passwordHash);

    if (!isEquals) {
      throw new Error('Невірний пароль');
    }

    const candidate = await User.findOne({ where: { email: newEmail } });

    if (candidate) {
      throw new Error('Ця пошта вже зайнята');
    }

    user.pendingEmail = newEmail;
    await user.save();

    await mailService.sendEmailChangeNotification(
      user.email,
      `Отримано запит на зміну пошти на ${newEmail}`,
    );

    return {
      message:
        'Запит на зміну пошти створено. Перевірте пошту для підтвердження.',
    };
  }
}

module.exports = {
  userService: new UserService(),
};
