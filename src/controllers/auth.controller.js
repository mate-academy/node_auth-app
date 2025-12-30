'use strict';

const { User } = require('../models/user.js');
const emailService = require('../services/email.service.js');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body || {};

    if (!email || !password || !name) {
      return res
        .status(400)
        .send('перевірте наявність email, password та name');
    }

    if (password.length < 10) {
      return res.status(400).send('Пароль має бути не менше 10 символів');
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).send('Користувач з такою поштою вже є');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const activationToken = uuidv4();

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      activationToken,
    });

    await emailService.activateSendEmail(email, activationToken);

    res.status(201).send({
      message: 'Користувача створено. Перевірте пошту для активації',
      email: newUser.email,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const activation = async (req, res) => {
  try {
    const { activationToken } = req.params;

    const user = await User.findOne({ where: { activationToken } });

    if (!user) {
      return res.status(404).send('Користувача не знайдено');
    }

    user.activationToken = null;
    await user.save();

    res.redirect(`${process.env.CLIENT_HOST}/profile`);
  } catch (error) {
    res.status(500).send({ error: 'Внутрішня помилка сервера' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).send('Невірні дані');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send('Невірні дані');
    }

    if (user.activationToken !== null) {
      return res.status(403).send('акаунт ще не активовано');
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '30m' },
    );

    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 900000 });
    res.redirect(`${process.env.CLIENT_HOST}/profile`);
  } catch (error) {
    res.status(500).send({ error: 'Внутрішня помилка сервера' });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie('accessToken');
    res.redirect(`${process.env.CLIENT_HOST}/login`);
  } catch (error) {
    res.status(500).send({ error: 'Внутрішня помилка сервера' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user) {
      const resetToken = uuidv4();

      user.resetToken = resetToken;
      await user.save();
      await emailService.sendResetPasswordEmail(email, resetToken);
    }
    res.send('Лист для скидання надіслано');
  } catch (error) {
    res.status(500).send('Помилка сервера');
  }
};

const resetPasswordConfirm = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({ where: { resetToken: token } });

    if (!user) {
      return res.status(400).send('Недійсний токен');
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    await user.save();
    res.send('Пароль успішно змінено');
  } catch (error) {
    res.status(500).send('Помилка сервера');
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const { name, email, newPassword, oldPassword } = req.body;

    if (name) {
      user.name = name;
    }

    if (newPassword || (email && email !== user.email)) {
      const passwordCorrect = await bcrypt.compare(oldPassword, user.password);

      if (!passwordCorrect) {
        return res.status(400).send('Невірний старий пароль');
      }

      if (newPassword) {
        user.password = await bcrypt.hash(newPassword, 10);
      }

      if (email && email !== user.email) {
        const oldEmail = user.email;

        user.email = email;
        await emailService.sendEmailChangeNotification(oldEmail);
      }
    }

    await user.save();
    res.send('Профіль оновлено');
  } catch (error) {
    res.status(500).send('Помилка сервера');
  }
};

module.exports = {
  register,
  activation,
  login,
  logout,
  forgotPassword,
  resetPasswordConfirm,
  updateProfile,
};
