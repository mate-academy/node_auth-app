'use strict';

const express = require('express');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const { isAuthenticated } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Налаштування сесій
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 години
  }),
);

// Налаштування flash повідомлень
app.use(flash());

// Middleware для глобальних змінних
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  next();
});

// Налаштування EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Статичні файли
app.use(express.static(path.join(__dirname, 'public')));

// Парсинг тіла запиту
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Маршрути
app.use('/auth', authRoutes);
app.use('/profile', isAuthenticated, profileRoutes);

// Головна сторінка
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/profile');
  } else {
    res.redirect('/auth/login');
  }
});

// 404 сторінка
app.use('*', (req, res) => {
  res.status(404).render('404', {
    title: '404 - Сторінку не знайдено',
    user: req.session.user,
  });
});

// Обробка помилок
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);

  res.status(500).render('error', {
    title: 'Помилка сервера',
    error: err.message,
    user: req.session.user,
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Сервер запущено на порту ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Відкрийте http://localhost:${PORT} у браузері`);
});
