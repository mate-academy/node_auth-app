import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.model.js';
import emailService from './email.service.js';
import tokenService from './token.service.js';

class UserService {
  // --- СУЩЕСТВУЮЩИЕ МЕТОДЫ ---

  async registration(name, email, password) {
    const candidate = await User.findOne({ where: { email } });

    if (candidate) {
      throw new Error(`Пользователь с email ${email} уже существует`);
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const activationToken = uuidv4();

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      activationToken,
    });

    const activationLink = `${process.env.API_URL}/api/activate/${activationToken}`;

    await emailService.sendActivationMail(email, activationLink);

    return {
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async activate(token) {
    const user = await User.findOne({ where: { activationToken: token } });

    if (!user) {
      throw new Error('Некорректная ссылка активации');
    }

    user.isActive = true;
    user.activationToken = null;
    await user.save();

    return tokenService.generateToken({ userId: user.id });
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    if (!user.isActive) {
      throw new Error('Аккаунт не подтвержден. Проверьте почту');
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw new Error('Неверный пароль');
    }

    const token = tokenService.generateToken({ userId: user.id });

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  // --- НОВЫЕ И ИСПРАВЛЕННЫЕ МЕТОДЫ ---

  // 1. Тот самый getProfile, который требовало ревью
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'isActive'],
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    return user;
  }

  // 2. Метод смены имени
  async updateName(userId, name) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('Пользователь не найден');
    }
    user.name = name;
    await user.save();

    return { id: user.id, name: user.name, email: user.email };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const resetToken = uuidv4();

    user.resetToken = resetToken;
    await user.save();

    // Ссылка ведет на фронтенд, где юзер введет новый пароль
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await emailService.sendNotification(
      email,
      'Восстановление пароля',
      `Для сброса пароля перейдите по ссылке: ${resetLink}`,
    );
  }

  // 3. Метод финального сброса пароля по токену
  async resetPassword(token, newPassword) {
    const user = await User.findOne({ where: { resetToken: token } });

    if (!user) {
      throw new Error('Ссылка устарела или неверна');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null; // Очищаем токен после использования
    await user.save();
  }

  async updatePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId);
    const isPassEquals = await bcrypt.compare(oldPassword, user.password);

    if (!isPassEquals) {
      throw new Error('Старый пароль неверный');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  async updateEmail(userId, password, newEmail) {
    const user = await User.findByPk(userId);
    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw new Error('Неверный пароль');
    }

    const oldEmail = user.email;
    const activationToken = uuidv4();

    user.pendingEmail = newEmail;
    user.activationToken = activationToken;
    await user.save();

    await emailService.sendNotification(
      oldEmail,
      'Запрос на смену Email',
      `Ваш email меняется на ${newEmail}. Если это не вы — срочно смените пароль.`,
    );

    const link = `${process.env.API_URL}/api/activate-new-email/${activationToken}`;

    await emailService.sendActivationMail(newEmail, link);
  }
}

export default new UserService();
