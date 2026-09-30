import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendActivationEmail = async (to, link) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Активація акаунта',
    html: `<h1>Для активації перейдіть за посиланням:</h1><a href="${link}">${link}</a>`,
  });
};

export const sendPasswordResetEmail = async (to, link) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Скинути пароль',
    html: `<h1>Для відновлення пароля перейдіть за посиланням:</h1><a href="${link}">${link}</a>`,
  });
};

export const sendEmailChangeNotification = async (to, newEmail) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Зміна електронної пошти',
    html: `<p>Вашу пошту було змінено на: <strong>${newEmail}</strong>.</p>`,
  });
};
