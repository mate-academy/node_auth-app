/* eslint-disable no-console */
'use strict';

require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendActivationEmail = async (to, token) => {
  console.log('DEBUG: SMTP_USER is', process.env.SMTP_USER);

  const activationLink = `${process.env.CLIENT_URL}/auth/activate/${token}`;

  // Додаємо try/catch саме для відправки пошти,
  // щоб побачити реальну помилку в консолі
  try {
    await transporter.sendMail({
      from: '"Accounting App" <auth@example.com>',
      to,
      subject: 'Account Activation',
      html: `
        <h1>Вітаємо з реєстрацією!</h1>
        <p>Для активації перейдіть за посиланням:</p>
        <a href="${activationLink}">${activationLink}</a>
      `,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Nodemailer Error:', error);
    throw error; // Прокидаємо помилку далі в контролер
  }
};

const sendResetPasswordEmail = async (to, resetToken) => {
  console.log('DEBUG: SMTP_USER is', process.env.SMTP_USER);

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Додаємо try/catch саме для відправки пошти,
  // щоб побачити реальну помилку в консолі
  try {
    await transporter.sendMail({
      from: '"Accounting App" <auth@example.com>',
      to,
      subject: 'Account Activation',
      html: `
        <h1>Вітаємо!</h1>
        <p>Для зміни пароля перейдіть за посиланням:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Nodemailer Error:', error);
    throw error; // Прокидаємо помилку далі в контролер
  }
};

const sendEmailChangeNotification = async (oldEmail, newEmail) => {
  try {
    await transporter.sendMail({
      from: '"Accounting App" <auth@example.com>',
      to: oldEmail,
      subject: 'Ваш email було змінено',
      html: `
        <h1>Повідомлення про безпеку</h1>
        <p>Ваш обліковий запис тепер прив'язано до нової пошти: <strong>${newEmail}</strong>.</p>
        <p>Якщо це зробили не ви, негайно зверніться в підтримку.</p>
      `,
    });
  } catch (error) {
    console.error('Notification Email Error:', error);
  }
};

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangeNotification,
};
