'use strict';
/* eslint-disable no-console */

require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');

require('./models/User');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Спочатку перевіряємо, чи є конект до Postgres
    await sequelize.authenticate();
    console.log('✅ Підключення до бази даних успішне!');

    await sequelize.sync({ alter: true });
    console.log('✅ Таблиці синхронізовано з базою!');

    // Тільки якщо база відповіла, запускаємо веб-сервер
    app.listen(PORT, () => {
      console.log(`🌐 Сервер запущено на порту ${PORT}`);
      console.log(`Відкрий http://localhost:${PORT} у браузері`);
    });
  } catch (error) {
    console.error('❌ Деталі помилки бази даних:', error);
    process.exit(1); // Зупиняємо процес, якщо база лежить
  }
};

startServer();
