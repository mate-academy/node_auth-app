'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const EmailService = require('../services/emailService');

const router = express.Router();

// Middleware для перевірки помилок валідації
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);

    return res.redirect('back');
  }

  next();
};

// Сторінка профілю
router.get('/', (req, res) => {
  res.render('profile/index', {
    title: 'Профіль',
    user: req.session.user,
  });
});

// Сторінка редагування імені
router.get('/edit-name', (req, res) => {
  res.render('profile/edit-name', {
    title: 'Зміна імені',
    user: req.session.user,
  });
});

// Обробка зміни імені
router.post(
  '/edit-name',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Ім'я має бути від 2 до 50 символів"),
  ],
  handleValidationErrors,
  (req, res) => {
    try {
      const { name } = req.body;
      const user = User.findById(req.session.user.id);

      if (user.updateName(name)) {
        // Оновлюємо сесію
        req.session.user.name = name;
        req.flash('success', "Ім'я успішно оновлено!");
      } else {
        req.flash('error', "Не вдалося оновити ім'я");
      }

      res.redirect('/profile');
    } catch (error) {
      req.flash('error', 'Помилка при оновленні імені');
      res.redirect('/profile/edit-name');
    }
  },
);

// Сторінка зміни пароля
router.get('/change-password', (req, res) => {
  res.render('profile/change-password', {
    title: 'Зміна пароля',
    user: req.session.user,
  });
});

// Обробка зміни пароля
router.post(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Введіть поточний пароль'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Новий пароль має бути не менше 8 символів')
      .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Новий пароль має містити великі та малі літери та цифри'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Нові паролі не співпадають');
      }

      return true;
    }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = User.findById(req.session.user.id);

      await user.updatePassword(currentPassword, newPassword);

      req.flash('success', 'Пароль успішно змінено!');
      res.redirect('/profile');
    } catch (error) {
      req.flash('error', error.message);
      res.redirect('/profile/change-password');
    }
  },
);

// Сторінка зміни email
router.get('/change-email', (req, res) => {
  res.render('profile/change-email', {
    title: 'Зміна електронної адреси',
    user: req.session.user,
  });
});

// Обробка зміни email
router.post(
  '/change-email',
  [
    body('password').notEmpty().withMessage('Введіть поточний пароль'),
    body('newEmail')
      .isEmail()
      .normalizeEmail()
      .withMessage('Введіть коректну нову електронну пошту'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { password, newEmail } = req.body;
      const user = User.findById(req.session.user.id);

      // Перевірка поточного пароля
      const isPasswordValid = await User.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        req.flash('error', 'Неправильний поточний пароль');

        return res.redirect('/profile/change-email');
      }

      // Збереження старого email для повідомлення
      const oldEmail = user.email;

      // Оновлення email
      user.updateEmail(newEmail, password);

      // Оновлення сесії
      req.session.user.email = newEmail;

      // Відправка повідомлення на стару пошту
      await EmailService.sendEmailChangeNotification(oldEmail, user.name);

      req.flash('success', 'Електронну адресу успішно змінено!');
      res.redirect('/profile');
    } catch (error) {
      req.flash('error', error.message);
      res.redirect('/profile/change-email');
    }
  },
);

module.exports = router;
