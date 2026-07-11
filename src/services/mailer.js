const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const sendActivationMail = async (to, token) => {
  const activationLink = `http://localhost:${process.env.PORT || 3000}/activate/${token}`;

  await transporter.sendMail({
    from: '"Auth App" <noreply@authapp.com>',
    to,
    subject: 'Активація акаунта',
    html: `
      <h1>Вітаємо в нашому додатку!</h1>
      <p>Для активації акаунта перейдіть за посиланням нижче:</p>
      <a href="${activationLink}">Активувати акаунт</a>
    `,
  });
};

const sendResetMail = async (to, token) => {
  const resetLink = `http://localhost:3000/password/reset/${token}`;

  await transporter.sendMail({
    from: '"Мій Додаток" <noreply@example.com>',
    to,
    subject: 'Відновлення пароля',
    html: `
      <h2>Відновлення пароля</h2>
      <p>Ви зробили запит на зміну пароля. Перейдіть за посиланням нижче, щоб встановити новий (посилання дійсне 1 годину):</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });
};

// Додай цю функцію до існуючих
const sendEmailChangeNotification = async (oldEmail, newEmail) => {
  await transporter.sendMail({
    from: '"Мій Додаток" <noreply@example.com>',
    to: oldEmail, // Відправляємо на СТАРУ пошту
    subject: 'Увага: зміна email-адреси',
    html: `
      <h2>Зміна email-адреси</h2>
      <p>Повідомляємо, що email для вашого акаунта було щойно змінено на <b>${newEmail}</b>.</p>
      <p>Якщо це зробили не ви, негайно зверніться до служби підтримки.</p>
    `,
  });
};

module.exports = {
  sendActivationMail,
  sendResetMail,
  sendEmailChangeNotification,
};
