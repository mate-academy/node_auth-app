'use strict';
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const { authRouter } = require('./routes/authRouter');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Мідлвари для обробки JSON, куків та CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use('/api', authRouter);

// Тестовий маршрут
app.get('/', (req, res) => {
  res.send('Auth API Server is running!');
});

// Синхронізація з БД та запуск сервера
const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Створить таблиці, якщо їх немає
    console.log('✅ Підключення до бази даних PostgreSQL успішне');

    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущено на порту ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Помилка підключення до бази даних:', error);
  }
};

startServer();
