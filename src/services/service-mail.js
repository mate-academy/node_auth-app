import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // only for tests not for production
  },
});

export const sendMail = ({ to, subject, text = 'nothing to say', html }) => {
  return transporter.sendMail({
    from: `AUTO-MAIL <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

export const sendActivationMail = (email, token) => {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return sendMail({
    to: email,
    subject: 'Activate account',
    html: `
    <p>Click link to activate account</p>
    <a href=${link}>${link}</a>
    `,
  });
};
