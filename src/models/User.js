'use strict';

const bcrypt = require('bcryptjs');

// crypto вже є глобальною змінною в Node.js
// Імітація бази даних (в реальному проекті використовуйте MongoDB, PostgreSQL)
const users = [];
let resetTokens = [];

class User {
  constructor(name, email, password) {
    this.id = Date.now().toString();
    this.name = name;
    this.email = email;
    this.password = password;
    this.isActive = false;
    this.activationToken = crypto.randomBytes(32).toString('hex');
    this.createdAt = new Date();
  }

  // Хешування пароля
  static async hashPassword(password) {
    const saltRounds = 10;

    return bcrypt.hash(password, saltRounds);
  }

  // Перевірка пароля
  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  // Створення нового користувача
  static async create(name, email, password) {
    // Перевірка, чи існує користувач з такою поштою
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      throw new Error('Користувач з такою електронною поштою вже існує');
    }

    // Валідація пароля
    if (password.length < 8) {
      throw new Error('Пароль має бути не менше 8 символів');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error('Пароль має містити великі та малі літери та цифри');
    }

    const hashedPassword = await this.hashPassword(password);
    const newUser = new User(name, email, hashedPassword);

    users.push(newUser);

    return newUser;
  }

  // Пошук користувача за email
  static findByEmail(email) {
    return users.find((u) => u.email === email);
  }

  // Пошук користувача за ID
  static findById(id) {
    return users.find((u) => u.id === id);
  }

  // Активація користувача
  static activateByToken(token) {
    const userToActivate = users.find((u) => u.activationToken === token);

    if (userToActivate) {
      userToActivate.isActive = true;
      userToActivate.activationToken = null;

      return userToActivate;
    }

    return null;
  }

  // Створення токена для скидання пароля
  static createResetToken(email) {
    const userToReset = this.findByEmail(email);

    if (!userToReset) {
      throw new Error('Користувача з такою електронною поштою не знайдено');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 година

    resetTokens.push({
      email,
      token,
      expiresAt,
    });

    return token;
  }

  // Перевірка токена для скидання пароля
  static verifyResetToken(token) {
    const resetToken = resetTokens.find((rt) => rt.token === token);

    if (!resetToken) {
      return null;
    }

    if (new Date() > resetToken.expiresAt) {
      // Видаляємо протермінований токен
      resetTokens = resetTokens.filter((rt) => rt.token !== token);

      return null;
    }

    return resetToken;
  }

  // Скидання пароля
  static async resetPassword(token, newPassword) {
    const resetToken = this.verifyResetToken(token);

    if (!resetToken) {
      throw new Error('Недійсний або протермінований токен');
    }

    const userToReset = this.findByEmail(resetToken.email);

    if (!userToReset) {
      throw new Error('Користувача не знайдено');
    }

    // Валідація нового пароля
    if (newPassword.length < 8) {
      throw new Error('Пароль має бути не менше 8 символів');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      throw new Error('Пароль має містити великі та малі літери та цифри');
    }

    userToReset.password = await this.hashPassword(newPassword);

    // Видаляємо використаний токен
    resetTokens = resetTokens.filter((rt) => rt.token !== token);

    return userToReset;
  }

  // Оновлення імені
  updateName(newName) {
    if (newName && newName.trim().length > 0) {
      this.name = newName.trim();

      return true;
    }

    return false;
  }

  // Оновлення пароля
  async updatePassword(oldPassword, newPassword) {
    const isOldPasswordCorrect = await User.comparePassword(
      oldPassword,
      this.password,
    );

    if (!isOldPasswordCorrect) {
      throw new Error('Неправильний поточний пароль');
    }

    // Валідація нового пароля
    if (newPassword.length < 8) {
      throw new Error('Пароль має бути не менше 8 символів');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      throw new Error('Пароль має містити великі та малі літери та цифри');
    }

    this.password = await User.hashPassword(newPassword);

    return true;
  }

  // Оновлення email
  updateEmail(newEmail, password) {
    // Перевірка, чи існує користувач з новою поштою
    const existingUser = users.find(
      (u) => u.email === newEmail && u.id !== this.id,
    );

    if (existingUser) {
      throw new Error('Користувач з такою електронною поштою вже існує');
    }

    this.email = newEmail;

    return true;
  }

  // Отримання даних користувача без пароля
  toJSON() {
    const { password, activationToken, ...userData } = this;

    return userData;
  }
}

module.exports = User;
