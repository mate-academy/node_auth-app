'use strict';

const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { revoke } = require('./newfile');

const passport = require('../config/passport');
const { User } = require('../User.model');
const {
  sendActivationEmail,
  sendEmailChangedNotification,
  sendPassChangedNotification,
  sendemailChange,
} = require('./mail.service');
const { signAccessToken } = require('./jwt.service');
const {
  PASSWORD_RULES,
  validateName,
  validateEmail,
  validatePassword,
} = require('../utils/validation');

// Те, що можна віддавати клієнту
const normalizeUser = ({ id, name, email }) => ({ id, name, email });

// GET /password-rules
const getPasswordRules = (req, res) => {
  res.send({ rules: PASSWORD_RULES.map((rule) => rule.message) });
}; // штука яка просто повертає масив даних з рядками

// POST /registration
const register = async (req, res, next) => {
  try {
    const { name, email, password, consent } = req.body || {};
    // отриманий від клієнта запит

    // Згода на збереження даних в БД обов'язкова
    if (consent !== true) {
      res.status(400).send({
        message: 'Validation error',
        errors: {
          consent: 'You must agree to the storing of your data',
        },
      });

      return;
    }

    // значення
    const errors = {};
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordErrors = validatePassword(password);

    // ці речі накопичуються в errors
    // більшість беремо з validation.js
    if (nameError) {
      errors.name = nameError;
    }

    if (emailError) {
      errors.email = emailError;
    }

    if (passwordErrors.length > 0) {
      errors.password = passwordErrors;
    }

    // якщо хоч якісь помилки існують, кидаємо їх у клієнт

    if (Object.keys(errors).length > 0) {
      res.status(400).send({ message: 'Validation error', errors });

      return;
    }

    // типу як нормальний email
    const normalizedEmail = email.trim().toLowerCase();

    // знаходимо в sql  базі такий самий об'єкт
    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
    });

    // якщо такий існує, кидаємо зовсім інший статус
    if (existingUser) {
      res.status(409).send({
        message: 'User with this email already exists',
        errors: { email: 'Email is already taken' },
      });

      return;
    }

    //  це стандартне значення для bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = randomUUID();
    // наший рандомний рядок для активації токену

    // якщо ми пройшли всі перевірки
    // створюємо об'єкт в моделі
    // за наступними значеннями
    // тепер цей об'єкт лежить в бд
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      activationToken,
    });

    // тут ми використовуємо наший sendActivationEmail
    // і кидаємо туди  email та activationToken
    try {
      await sendActivationEmail(user.email, activationToken);
      // якщо щось сталось, видаляємо той об'єкт і кидаємо помилку
    } catch (error) {
      await user.destroy();

      res.status(500).send({ message: 'Could not send the activation email' });

      return;
    }

    // якщо все вийшло, кидаємо 201
    // і в деструктуризацію кидаємо user,

    res.status(201).send({
      message:
        'Registration successful. Check your email to activate the account.',
      user: normalizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// PATCh /forgot-pass
const changepass = async (req, res, next) => {
  try {
    const { token, password, conf } = req.body || {};

    const existingUser = await User.findOne({
      where: { resetToken: token },
    });

    const errors = {};
    const passwordErrors = validatePassword(password);

    if (password !== conf) {
      errors.password =
        'new password and confiramtion password are not the same';
    }

    if (passwordErrors.length > 0) {
      errors.password = passwordErrors;
    }

    if (!existingUser) {
      res.status(404).send({
        message: 'This User has not permission to change password',
      });

      return;
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).send({ message: 'Validation error', errors });

      return;
    }

    // тут іде вже логіка яка помилок не стосується
    const hashedPassword = await bcrypt.hash(conf, 10);

    try {
      await existingUser.update({
        password: hashedPassword,
        resetToken: null,
      });
    } catch (err) {
      next(err);
    }

    // якщо все вийшло, кидаємо 201
    // і в деструктуризацію кидаємо user,

    res.status(201).send({
      message: 'Everything is good, password is updated',
    });
  } catch (err) {
    next(err);
  }
};

// GET /activation/:activationToken
const activate = async (req, res, next) => {
  try {
    const { activationToken } = req.params;
    // отримуємо рандомне рядкове число з лінка
    // тобто от заходить чувак на лист
    // і activationToken і є цей лінк, точніше частина його

    const user = await User.findOne({ where: { activationToken } });
    // шукаємо по лінку юзера

    // якщо такого немає, кидаємо 404
    if (!user) {
      res.status(404).send({
        message: 'Activation link is invalid or has already been used',
      });

      return;
    }

    // якщо ж все пройшло на гуд, видаляємо
    //  activationToken та робимо що воно все ж true
    await user.update({ activationToken: null, isActive: true });

    // кидаємо активацію

    res.send({
      message: 'Account activated',
      accessToken: signAccessToken(user),
      user: normalizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// POST /login (Passport local strategy -> JWT)
const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (error, user, info) => {
    // оці всі значення йдуть з паспорта
    // user - об'єкт, який ми формуємо в passport.js
    // саме з localstrategy
    // info - ті месседжі які ми отримували
    // якщо помилка то помилка..
    if (error) {
      return next(error);
    }

    // якщо юзера не існує, кидаємо 401
    if (!user) {
      return res.status(401).send({ message: info?.message || 'Unauthorized' });
    }

    // повертаємо просто відповідь клієнту,
    return res.send({
      accessToken: signAccessToken(user),
      user: normalizeUser(user),
    });
  })(req, res, next);
};

// GET /profile (JWT)
const getProfile = (req, res) => {
  res.send({ user: normalizeUser(req.user) });
  // просто кидаємо те що отримали
};

// GET /users (потрібен JWT; без паролів)
const getUsers = async (req, res, next) => {
  // отримуємо всіх юзерів
  try {
    const users = await User.findAll();

    res.send(users.map(normalizeUser));
  } catch (error) {
    next(error);
  }
};

// PATCH

const patching = async (req, res, next) => {
  try {
    const { name } = req.body || {};

    const errors = {};
    const nameError = validateName(name);

    if (nameError) {
      errors.name = nameError;
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).send({ message: 'Validation error', errors });

      return;
    }

    await req.user.update({
      name: name.trim(),
    });

    res.status(201).send({
      message: 'Patching is successful, HA!',
      user: normalizeUser(req.user),
    });
  } catch (err) {
    next(err);
  }
};

const parol = async (req, res, next) => {
  try {
    const { email, password, newPassword, confirmation } = req.body || {};

    const isOldPasswordCorrect = await bcrypt.compare(
      String(password || ''),
      req.user.password,
    );

    if (!isOldPasswordCorrect) {
      res.status(400).send({
        message: 'Old password is incorrect',
        errors: { form: 'Old password is incorrect' },
      });

      return;
    }

    if (newPassword !== confirmation) {
      res.status(400).send({
        message: 'New password and confirmation have to be the same',
        errors: { form: 'New password and confirmation have to be the same' },
      });

      return;
    }

    const passwordErrors = validatePassword(newPassword);

    if (passwordErrors.length > 0) {
      res.status(400).send({
        message: 'Validation error',
        errors: { password: passwordErrors },
      });

      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const thisEmail = email.trim().toLowerCase();

    await sendPassChangedNotification(thisEmail);

    try {
      await req.user.update({ password: hashedPassword });
    } catch (error) {
      res.status(500).send({ message: 'Could not send the password' });
    }

    res.send({
      message: 'Password changed successfully',
      user: normalizeUser(req.user),
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /profile/email (потрібен JWT)
const changeEmail = async (req, res, next) => {
  try {
    const { password, newEmail, confirmEmail } = req.body || {};
    const errors = {};
    // Підтвердження паролем: порівнюємо введений пароль з хешем у базі.

    const isPasswordCorrect = await bcrypt.compare(
      String(password || ''),
      req.user.password,
    );

    if (!isPasswordCorrect) {
      errors.password = 'Password is incorrect';
    }

    const emailError = validateEmail(newEmail);

    if (emailError) {
      // якщо є помилка emailError то кидаємо її в errors
      // з ключем newEmail
      errors.newEmail = emailError;
    } else if (
      typeof confirmEmail !== 'string' ||
      confirmEmail.trim().toLowerCase() !== newEmail.trim().toLowerCase()
      // якщо confirmEmail не строка або ж confirmEmail не сходиться з newEmail
      // кидаємо помилку confirmEmail
    ) {
      errors.confirmEmail = 'Emails do not match';
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).send({ message: 'Validation error', errors });

      return;
    }
    // закінчення нашої перевірки, якщо якісь помилки знайшлись,
    // то просто кидаємо їх в клієнта

    const normalizedEmail = newEmail.trim().toLowerCase();

    if (normalizedEmail === req.user.email) {
      res.status(400).send({
        message: 'Validation error',
        errors: { newEmail: 'This is already your email' },
      });

      return;
    } // якщо такий імейл уже є, кидаємо інфу про це клієнту

    // Новий email не має бути зайнятий іншим акаунтом
    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).send({
        message: 'Email is already taken',
        errors: { newEmail: 'Email is already taken' },
      });

      return;
    }

    const oldEmail = req.user.email;

    await req.user.update({ email: normalizedEmail });

    // Email уже змінено, тому якщо лист
    // не відправився, просто пишемо помилку в консоль.
    try {
      await sendEmailChangedNotification(oldEmail, normalizedEmail);
    } catch (error) {
      /* eslint-disable-next-line */
      console.error('Failed to send email change notification:', error);
    }

    res.send({
      message: 'Email updated',
      user: normalizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  revoke(req.tokenPayload.jti);

  res.send({ message: 'Logged out' });
};

const sentEmail = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const errors = {};
    const normalizedEmail = email.trim().toLowerCase();

    const emailError = validateEmail(email);

    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (!existingUser) {
      res.status(409).send({
        errors: { newEmail: 'Email is not taken' },
      });

      return;
    }

    if (emailError) {
      errors.email = emailError;
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).send({ message: 'Validation error', errors });
    }

    // логіка кидання імейлу
    if (existingUser && existingUser.isActive) {
      const resetToken = randomUUID();

      await existingUser.update({ resetToken });

      try {
        await sendemailChange(existingUser.email, resetToken);
      } catch (error) {
        await existingUser.update({ resetToken: null });

        res.status(500).send({ message: 'Could not send the reset email' });

        return;
      }
    }

    res.send({ message: `envelope is sent, take a look on your ${email}` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPasswordRules,
  register,
  activate,
  login,
  getProfile,
  getUsers,
  patching,
  changeEmail,
  parol,
  logout,
  changepass,
  sentEmail,
};
