/* eslint-disable no-console */
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendActivationEmail = async (user) => {
  const link = `http://localhost:5173/activate/${user.activationToken}`;

  try {
    await transporter.sendMail({
      to: user.email,
      subject: 'Activate account',
      html: `<a href="${link}">Activate</a>`,
    });

    console.log('Activation email sent');
  } catch (err) {
    console.error('EMAIL ERROR:', err);
  }
};

export const sendResetEmail = async (user) => {
  const link = `http://localhost:5173/reset-password/${user.resetToken}`;

  try {
    await transporter.sendMail({
      to: user.email,
      subject: 'Reset password',
      html: `
        <h2>Password reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${link}">${link}</a>
      `,
    });

    console.log('Reset email sent');
  } catch (err) {
    console.error('RESET EMAIL ERROR:', err);
  }
};
