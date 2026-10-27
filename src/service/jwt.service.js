'use strict';

const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');

const getSecret = () => {
  const { JWT_SECRET } = process.env;
  // console.log(require('crypto').randomBytes(48).toString('hex'));

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in .env'); // проста перевірка чи є
    // набір символів
  }

  return JWT_SECRET; // повертаємо це
};

const signAccessToken = (user) => {
  return jwt.sign({ sub: user.id, email: user.email }, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    jwtid: randomUUID(), // унікальний номер токена
    // для кожного створеного токена
  }); // тут ми створюємо хешований рядок,
  //  який можна розпакувати, і отримати типу як об'єкт?
  // jwt.sign - функція яка хешує об'єкт і перетворює його на рядок
  // який буде існувати годину
  // ця функція повертає рядок хешованого об'єкта
  // потім цей об'єкт ще отримує інформацію про те скільки часу
  // він може існувати, і це все повертається
  // на виході отримуємо щось типу'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
  // .eyJzdWIiOjE1LCJlbW
  // FpbCI6InVzZXJAZ
  // XhhbXBsZS5jb20iLCJ
  // pYXQiOjE3NjA1MDAwMDAsImV4cCI6MTc2MDUwMzYwMH0
  // .a1B2c3D4e5F6g
  // 7H8i9J0kLmNoP
  // qRsTuVwXyZ1234567'
};

module.exports = {
  getSecret, // наший рандомний рядок
  signAccessToken, // ще один рядок
};
