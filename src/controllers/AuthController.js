import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import * as mailService from '../services/mailService';

export const register = async (req, res) => {
  const { email, password, name } = req.body;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  try {
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Пароль занадто слабкий: мінімум 8 символів, одна велика ' +
          'літера та одна цифра.',
      });
    }

    const candidate = await User.findOne({ where: { email } });

    if (candidate) {
      return res
        .status(400)
        .json({ message: 'Користувач з таким email вже існує' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = uuidv4();

    await User.create({
      name,
      email,
      password: hashedPassword,
      activationToken,
      isActive: false,
    });

    await mailService.sendActivationMail(email, activationToken);

    res.status(201).json({
      message: 'Користувача зареєстровано. Перевірте пошту для активації.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка на сервері під час реєстрації' });
  }
};

export const activate = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ where: { activationToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Невірне посилання' });
    }

    user.isActive = true;
    user.activationToken = null;
    await user.save();

    return res.status(200).redirect('/profile');
  } catch (error) {
    res.status(500).json({ message: 'Помилка на сервері під час реєстрації' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Невірні дані' });
    }

    if (user.isActive === false) {
      return res
        .status(400)
        .json({ message: 'Будь ласка, активуйте свій email', email });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Невірний email або пароль' });
    }
    req.session.userId = user.id;

    return res.status(200).json({
      message: 'Вхід успішний',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка на сервері під час реєстрації' });
  }
};

export const logOut = (req, res) => {
  if (!req.session) {
    return res.redirect('/login');
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Не вдалося вийти з системи' });
    }

    res.clearCookie('connect.sid');

    return res.redirect('/login');
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return await res
        .status(200)
        .json({ message: 'Якщо email існує, лист буде відправлено' });
    }

    user.resetPasswordToken = uuidv4();
    await mailService.sendPasswordResetMail(email, user.resetPasswordToken);

    const expires = new Date(Date.now() + 3600000);

    user.resetPasswordExpires = expires;

    await user.save();

    return res.status(200).redirect('/email');
  } catch (error) {
    res.status(500).json({ message: 'Помилка на сервері під час реєстрації' });
  }
};

export const resetPasswordConfirmation = async (req, res) => {
  try {
    const { token } = req.params;
    const { confirmation, password } = req.body;

    if (password !== confirmation) {
      return res.status(400).json({ message: 'Пароль не співпадає' });
    }

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Токен недійсний або час вийшов' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).redirect('/successPage');
  } catch (error) {
    res.status(500).json({ message: 'Помилка на сервері під час реєстрації' });
  }
};
