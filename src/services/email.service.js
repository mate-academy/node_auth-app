import 'dotenv/config';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  const info = await transporter.sendMail({
    from: `"Auth App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  return info;
};

const sendActivationEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
    <h1>Account Activation</h1>
    <p>Please click the link below to activate your account:</p>
    <a href="${href}">${href}</a>`;

  sendEmail(email, 'Account Activation', html);
};

export const emailService = { sendEmail, sendActivationEmail };
