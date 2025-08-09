/* eslint-disable no-console */
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { hashPassword, comparePasswords } from '../utils/password.js';
import { sendEmail } from '../utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Пароль має бути мінімум 8 символів',
      });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Користувач з таким email вже існує' });
    }

    const passwordHash = await hashPassword(password);

    await User.create({
      name,
      email,
      passwordHash,
      isActivated: false,
    });

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });

    const activationLink = `${BACKEND_URL}/api/auth/activate/${token}`;

    await sendEmail({
      to: email,
      subject: 'Активація акаунта',
      html: `
        <p>Дякуємо за реєстрацію!</p>
        <p>Щоб активувати акаунт, будь ласка, перейдіть за посиланням:</p>
        <a href="${activationLink}">${activationLink}</a>
      `,
    });

    return res.status(201).json({
      message: 'Користувача створено! Перевірте пошту для активації акаунта.',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Відсутній токен активації' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    if (user.isActivated) {
      return res.status(400).json({ message: 'Акаунт вже активований' });
    }

    user.isActivated = true;
    await user.save();

    return res.redirect(`${FRONTEND_URL}/profile`);
  } catch (error) {
    console.error(error);

    return res.status(400).json({ message: 'Невірний або прострочений токен' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email та пароль обов’язкові' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Невірний email або пароль' });
    }

    if (!user.isActivated) {
      return res
        .status(403)
        .json({ message: 'Будь ласка, активуйте ваш акаунт через пошту' });
    }

    const isMatch = await comparePasswords(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний email або пароль' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({ token, message: 'Вхід успішний' });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  // eslint-disable-next-line no-shadow
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({ message: 'Якщо користувач існує, лист надіслано' });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

    const resetLink = `${BACKEND_URL}/api/auth/reset-password/${token}`;

    console.log(`http://localhost:3000/reset-password/${token}`);

    await sendEmail({
      to: email,
      subject: 'Скидання пароля',
      html: `
        <p>Для скидання пароля перейдіть за посиланням:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Якщо ви не робили цей запит, просто ігноруйте лист.</p>
      `,
    });

    res.json({ message: 'Якщо користувач існує, лист надіслано' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Паролі не співпадають' });
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message: 'Пароль має бути мінімум 8 символів',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.passwordHash = hashedPassword;
    await user.save();

    res.json({ message: 'Пароль успішно змінено' });
  } catch (error) {
    console.error(error);

    return res.status(400).json({ message: 'Невірний або прострочений токен' });
  }
};
