import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const smtpPort = Number(process.env.SMTP_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  requireTLS: smtpPort === 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

const sendMail = async (options) => {
  try {
    await transporter.sendMail({
      from: fromAddress,
      ...options,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Email send failed', error);

    const err = new Error('Не вдалося надіслати лист, спробуйте пізніше.');

    err.status = 500;
    throw err;
  }
};

export const verifyEmailTransport = async () => {
  try {
    await transporter.verify();
    // eslint-disable-next-line no-console
    console.log('SMTP connected');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('SMTP connection failed', error);

    const err = new Error('Email transport is not configured correctly');

    err.status = 500;
    throw err;
  }
};

export const sendActivationEmail = async ({ to, token }) => {
  const link = `${appUrl}/activate/${token}`;

  await sendMail({
    to,
    subject: 'Активуйте ваш акаунт',
    html: `
      <p>Дякуємо за реєстрацію!</p>
      <p>Перейдіть за посиланням, щоб активувати акаунт:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Якщо ви не реєструвалися, проігноруйте цей лист.</p>
    `,
  });
};

export const sendResetEmail = async ({ to, token }) => {
  const link = `${appUrl}/reset-password?token=${token}`;

  await sendMail({
    to,
    subject: 'Відновлення пароля',
    html: `
      <p>Ви запросили відновлення пароля.</p>
      <p>Скористайтесь посиланням нижче, щоб встановити новий пароль (дійсне 1 годину):</p>
      <p><a href="${link}">${link}</a></p>
      <p>Якщо це були не ви, проігноруйте цей лист.</p>
    `,
  });
};

export const sendEmailChangeNotice = async ({ to, newEmail }) => {
  await sendMail({
    to,
    subject: 'Зміну email виконано',
    html: `
      <p>Ваш email для входу було змінено на: <strong>${newEmail}</strong></p>
      <p>Якщо це були не ви, якнайшвидше змініть пароль і зверніться в підтримку.</p>
    `,
  });
};
