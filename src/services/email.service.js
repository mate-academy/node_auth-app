import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${email}/${token}`;

  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate',
  });
}

function sendEmailChangeNotification(oldEmail, newEmail) {
  const html = `
  <h1>Увага: Зміна електронної пошти</h1>
  <p>Вітаємо!</p>
  <p>Повідомляємо, що електронну пошту для вашого акаунта було щойно змінено.</p>
  <p><strong>Стара пошта:</strong> ${oldEmail}</p>
  <p><strong>Нова пошта:</strong> ${newEmail}</p>
  <p>Якщо ви не робили цих змін, будь ласка, негайно зверніться до служби підтримки.</p>
  `;

  return send({
    email: oldEmail,
    html,
    subject: 'Security Alert: Зміна електронної пошти',
  });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  const html = `
  <h1>Відновлення пароля</h1>
  <p>Ви отримали цей лист, оскільки зробили запит на скидання пароля.</p>
  <p>Щоб встановити новий пароль, перейдіть за посиланням нижче:</p>
  <a href="${href}">${href}</a>
  <p>Якщо ви не робили цього запиту, просто проігноруйте цей лист.</p>
  `;

  return send({
    email,
    html,
    subject: 'Скидання пароля',
  });
}

export const emailService = {
  sendActivationEmail,
  sendEmailChangeNotification,
  sendResetPasswordEmail,
  send,
};
