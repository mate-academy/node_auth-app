'use strict';

const http = require('http');
const express = require('express');
const cors = require('cors');

// Підключаємо бібліотеку cors.
// Вона допомагає браузеру дозволити frontend отримувати відповіді
// від backend, якщо вони мають різні origin.

const passport = require('./config/passport');
const authRouter = require('./routes/auth.routes');

const createServer = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      // origin - це адреса клієнта
      // process.env.CLIENT_URL — змінна середовища,
      // у якій можна зберегти адресу frontend.
    }),
  );
  app.use(express.json());
  // Підключаємо готовий middleware для розбору JSON.
  //
  // Коли клієнт надсилає JSON у тілі запиту,
  // наприклад { "email": "alex@example.com" },
  // Express розбирає його та записує результат у req.body.
  //
  // Завдяки цьому в маршрутах можна звертатися до req.body.email.

  app.use(passport.initialize());
  // Підключаємо middleware від Passport.
  // ця штука просто запускає passport
  // але вона сама по собі нічого не перевіряє
  // ця штука просто дозволяє викликати ті функції
  // які passport повертає

  app.use(authRouter);
  // Підключаємо роутер з маршрутами авторизації.
  //
  // Коли приходить запит, Express перевіряє,
  // чи відповідає він одному з маршрутів цього роутера.
  //
  // Наприклад, це може бути POST-запит для реєстрації
  // або входу — залежно від того, що описано в auth.routes.js.

  // eslint-disable-next-line
  app.use((error, req, res, next) => {
    // оце і є наший middleware
    //
    // error — об'єкт із інформацією про помилку.
    // req — HTTP-запит від клієнта.
    // res — HTTP-відповідь, яку повертаємо клієнту.
    // next — дозволяє передати помилку наступному обробнику,
    // якщо ми не хочемо обробляти її тут.
    if (error.type === 'entity.parse.failed') {
      res.status(400).send({ message: 'Invalid JSON' });

      // Перевіряємо, чи виникла помилка під час розбору JSON.
      // Наприклад, клієнт міг надіслати неправильно сформований JSON.

      return;
    }

    res.status(500).send({ message: 'Internal server error' });
  });

  return http.createServer(app);
};

module.exports = {
  createServer,
};

// Ідентифікація — користувач заявляє, хто він, наприклад, вводить email.

// Автентифікація — сервер перевіряє,
// чи справді користувач може увійти з цими даними.

// Авторизація — сервер перевіряє, чи має користувач право виконати певну дію.
