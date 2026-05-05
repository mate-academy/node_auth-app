import nodemailer from 'nodemailer';
import 'dotenv/config';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST as string,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASSWORD as string,
  },
});

export const sendActivationEmail = async (
  email: string,
  activationToken: string,
) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Активація акаунта',
    html: `<a href="${process.env.CLIENT_URL}/activate/${activationToken}">Активувати</a>`,
  });
};

export const sendResetPasswordEmail = async (
  email: string,
  resetToken: string,
) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Відновлення пароля',
    html: `<a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">Змінити пароль</a>`,
  });
};

export const sendEmailChangeNotif = async (email: string) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Зміна пошти',
    html: `<h1>Вашу пошту було змінено</h1>`,
  });
};
