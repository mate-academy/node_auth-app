/* eslint-disable no-console */
'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const usersRepository = require('../entity/users.repository');
const emailService = require('../services/email.service');
const jwt = require('jsonwebtoken');

// Приклад регулярного виразу
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Мінімум 8 символів, 1 велика, 1 мала, 1 цифра, 1 спецсимвол

const register = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Валідація вхідних даних
  if (!name || !email || !password) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  if (!passwordRegex.test(password)) {
    console.log('password in created is: ', password);

    res.status(400).json({
      message:
        // eslint-disable-next-line max-len
        'Password must be at Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character',
    });

    return;
  }

  // 2. Перевірка, чи не зайнятий email
  const existingUser = await usersRepository.getByEmail(email);

  if (existingUser) {
    return res.status(409).send({ message: 'Email is already in use' });
  }

  // 3. Хешування пароля (10 раундів — золотий стандарт)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Створення токена для email-активації
  const activationToken = uuidv4();

  try {
    const user = await usersRepository.create({
      name,
      email,
      password: hashedPassword,
      activationToken,
    });

    await emailService.sendActivationEmail(email, activationToken);

    console.log('password in created is: ', password);

    // 5. Поки що повертаємо юзера без пароля (пізніше додамо відправку Email)
    res.status(201).send({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).send({ message: 'Server error during registration' });
  }
};

const activate = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await usersRepository.getByToken(token);

    if (!user) {
      return res.status(404).send({ message: 'Activation token is invalid' });
    }

    // Оновлюємо статус
    user.isActivated = true;
    user.activationToken = null; // Токен одноразовий
    await user.save();

    // Можна відправити успішну відповідь або редирект на фронтенд
    res.send({ message: 'Account activated successfully!' });
  } catch (error) {
    res.status(500).send({ message: 'Activation failed' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Шукаємо користувача в базі за email
    const user = await usersRepository.getByEmail(email);

    if (!user) {
      return res.status(401).send({ message: 'Невірний email або пароль' });
    }

    // 2. Перевіряємо, чи активовано акаунт
    if (!user.isActivated) {
      return res.status(403).send({
        message: 'Будь ласка, активуйте свій email перед входом',
      });
    }

    // 3. Порівнюємо введений пароль з хешем у базі
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({ message: 'Невірний email або пароль' });
    }

    // 4. Генеруємо токени (Access та Refresh)
    const payload = { id: user.id, email: user.email };

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    });

    user.refreshToken = refreshToken;
    await user.save();

    // Кука для Access Token (короткоживуча)
    // ЗБЕРІГАЄМО Access Token у httpOnly cookie
    res.cookie('accessToken', accessToken, {
      maxAge: 15 * 60 * 1000, // 15 хвилин
      httpOnly: true,
      secure: false, // true для продакшну (HTTPS)
      sameSite: 'strict',
    });

    // Кука для Refresh Token (довгоживуча)
    // ЗБЕРІГАЄМО Refresh Token у httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
      httpOnly: true, // Забороняє доступ до куки через JS (захист від XSS)
      secure: false, // ТількичерезHTTPS(для локальної розробкиможнаfalse)
      sameSite: 'strict',
    });

    // 5. Відправляємо відповідь (дані юзера без пароля)
    res.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login Error:', error); // Це допоможе
    // побачити точну помилку в консолі сервера
    res.status(500).send({ message: 'Помилка на сервері під час входу' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).send({ message: 'Користувач не авторизований' });
    }

    // Перевірка токена
    const userData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Можна також перевірити,
    // чи є цей токен у базі даних (опціонально для безпеки)
    const user = await usersRepository.getByEmail(userData.email);

    if (!user || refreshToken !== user.refreshToken) {
      res.status(403).json({ message: 'Неправильний токен оновлення' });

      return;
    }

    const payload = { id: userData.id, email: userData.email };
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });

    res.send({ accessToken, user: payload });
  } catch (e) {
    return res.status(401).send({ message: 'Неправильний токен оновлення' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.sendStatus(204);

      return;
    }

    const user = await usersRepository.getByToken(refreshToken);

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // Очищуємо куку 'accessToken'
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false, // Має збігатися з налаштуваннями при логіні
      sameSite: 'strict',
    });

    // Очищуємо куку 'refreshToken'
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false, // Має збігатися з налаштуваннями при логіні
      sameSite: 'strict',
    });

    // Повертаємо статус 204 (No Content) або 200
    return res.sendStatus(204);
  } catch (error) {
    res.status(500).send({ message: 'Помилка при виході з системи' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await usersRepository.getByEmail(email);

    if (!user) {
      res.status(401).json({ message: 'Користувач не авторизований' });

      return;
    }

    const payload = { id: user.id, email: user.email };
    const resetToken = jwt.sign(payload, process.env.JWT_RESET_SECRET, {
      expiresIn: '1h',
    });

    user.resetToken = resetToken;
    await user.save();

    await emailService.sendResetPasswordEmail(email, resetToken);

    res.status(200).json({
      message: 'Будьл ласка перевіпте вашу пошту для відновлення пароля',
    });
  } catch (error) {
    console.error('Forgot Password:', error); // Це допоможе
    // побачити точну помилку в консолі сервера

    res.status(500).send({
      message:
        'Помилка на сервері під час відправлення листа для відновлення пароля',
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Missing token' });
    }

    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          // eslint-disable-next-line max-len
          'Password must be at Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character',
      });

      return;
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const payload = jwt.verify(token, process.env.JWT_RESET_SECRET);
    const user = await usersRepository.getByEmail(payload.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (token !== user.resetToken) {
      return res.status(401).json({ message: 'Invalid reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    await user.save();

    res.json({ message: 'Пароль успішно скинуто' });
  } catch (error) {
    console.error('Reset Password:', error); // Це допоможе
    // побачити точну помилку в консолі сервера

    res.status(500).send({
      message: 'Помилка на сервері під час відновлення пароля',
    });
  }
};

const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};

module.exports = {
  authController,
};
