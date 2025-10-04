import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendMail = ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: `Matejek <${process.env.SMTP_USER}>`,
    subject,
    to,
    text: text ?? '',
    html,
  });
};

export const sendActivationEmail = ({ email, activationToken }) => {
  const link = `${process.env.URL_CLIENT}/activation/${activationToken}`;

  return sendMail({
    to: email,
    subject: 'Account activation',
    text: 'Activate your account',
    html: `<p>Follow the link below to activate your account</p>
       <a href="${link}">${link}</a>`,
  });
};
