'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const EmailService = require('../services/emailService');
const { isNotAuthenticated } = require('../middleware/auth');

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

// Сторінка реєстрації
router.get('/register', isNotAuthenticated, (req, res) => {
  res.render('auth/register', {
    title: 'Реєстрація',
    user: null,
  });
});

// Обробка реєстрації
router.post(
  '/register',
  isNotAuthenticated,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Ім'я має бути від 2 до 50 символів"),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Введіть коректну електронну пошту'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Пароль має бути не менше 8 символів')
      .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Пароль має містити великі та малі літери та цифри'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Паролі не співпадають');
      }

      return true;
    }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Створення користувача
      const user = await User.create(name, email, password);

      // Відправка листа активації
      const emailSent = await EmailService.sendActivationEmail(
        email,
        name,
        user.activationToken,
      );

      if (emailSent) {
        res.render('auth/email-sent', {
          title: 'Email надіслано',
          user: null,
          message:
            'Реєстрація успішна! Перевірте вашу електронну пошту для ' +
            'активації облікового запису.',
        });
      } else {
        req.flash(
          'error',
          'Не вдалося відправити лист активації. Зверніться до адміністратора.',
        );
        res.redirect('/auth/login');
      }
    } catch (error) {
      req.flash('error', error.message);
      res.redirect('/auth/register');
    }
  },
);

// Сторінка входу
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('auth/login', {
    title: 'Вхід',
    user: null,
  });
});

// Обробка входу
router.post(
  '/login',
  isNotAuthenticated,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Введіть коректну електронну пошту'),
    body('password').notEmpty().withMessage('Введіть пароль'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Пошук користувача
      const user = User.findByEmail(email);

      if (!user) {
        req.flash('error', 'Неправильна електронна пошта або пароль');

        return res.redirect('/auth/login');
      }

      // Перевірка пароля
      const isPasswordValid = await User.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        req.flash('error', 'Неправильна електронна пошта або пароль');

        return res.redirect('/auth/login');
      }

      // Перевірка активності
      if (!user.isActive) {
        req.flash(
          'error',
          'Ваш обліковий запис не активований. Перевірте вашу електронну ' +
            'пошту для активації.',
        );

        return res.redirect('/auth/login');
      }

      // Створення сесії
      req.session.user = user.toJSON();
      req.flash('success', `Вітаємо, ${user.name}!`);
      res.redirect('/profile');
    } catch (error) {
      req.flash('error', 'Помилка входу в систему');
      res.redirect('/auth/login');
    }
  },
);

// Активація облікового запису
router.get('/activate/:token', isNotAuthenticated, (req, res) => {
  const { token } = req.params;

  const user = User.activateByToken(token);

  if (user) {
    // Створюємо сесію для автоматичного входу
    req.session.user = user.toJSON();

    req.flash(
      'success',
      'Ваш обліковий запис успішно активовано! Вітаємо в системі!',
    );
    res.redirect('/profile');
  } else {
    req.flash('error', 'Недійсний або протермінований токен активації.');
    res.redirect('/auth/login');
  }
});

// Сторінка запиту скидання пароля
router.get('/forgot-password', isNotAuthenticated, (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Скидання пароля',
    user: null,
  });
});

// Обробка запиту скидання пароля
router.post(
  '/forgot-password',
  isNotAuthenticated,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Введіть коректну електронну пошту'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.body;

      // Створення токена для скидання
      const resetToken = User.createResetToken(email);

      // Отримання користувача для відправки листа
      const user = User.findByEmail(email);

      // Відправка листа
      const emailSent = await EmailService.sendPasswordResetEmail(
        email,
        user.name,
        resetToken,
      );

      if (emailSent) {
        res.render('auth/email-sent', {
          title: 'Email надіслано',
          user: null,
          message:
            'Лист для скидання пароля надіслано на вашу електронну пошту.',
        });
      } else {
        req.flash('error', 'Не вдалося надіслати лист.');
        res.redirect('/auth/login');
      }
    } catch (error) {
      req.flash('error', error.message);
      res.redirect('/auth/forgot-password');
    }
  },
);

// Сторінка скидання пароля
router.get('/reset-password/:token', isNotAuthenticated, (req, res) => {
  const { token } = req.params;

  const resetToken = User.verifyResetToken(token);

  if (!resetToken) {
    req.flash(
      'error',
      'Недійсний або протермінований токен для скидання пароля.',
    );

    return res.redirect('/auth/login');
  }

  res.render('auth/reset-password', {
    title: 'Скидання пароля',
    user: null,
    token,
  });
});

// Обробка скидання пароля
router.post(
  '/reset-password/:token',
  isNotAuthenticated,
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Пароль має бути не менше 8 символів')
      .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Пароль має містити великі та малі літери та цифри'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Паролі не співпадають');
      }

      return true;
    }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Скидання пароля
      await User.resetPassword(token, password);

      res.render('auth/password-reset-success', {
        title: 'Пароль успішно змінено',
        user: null,
      });
    } catch (error) {
      req.flash('error', error.message);
      res.redirect(`/auth/reset-password/${req.params.token}`);
    }
  },
);

// Вихід
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('Помилка при виході:', err);
    }

    req.flash('success', 'Ви успішно вийшли з системи');
    res.redirect('/auth/login');
  });
});

module.exports = router;
