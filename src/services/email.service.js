import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const send = async ({ email, subject, html }) => await transporter.sendMail({
  to: email, // list of receivers
  subject, // Subject line
  html, // html body
});

const sendActivationEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;

  const html = `
    <h1>Activation link</h1>
    <a href=${href}>${href}</a>
  `;

  return send({
    email,
    subject: 'Activate',
    html,
  });
}

const sendResetEmail = (email, resetToken) => {
  const href = `${process.env.CLIENT_HOST}/resetpassword/${email}/${resetToken}`;

  const html = `
    <h1>Reset password link</h1>
    <a href=${href}>
    Reset Password confirmation page (with password and confirmation fields that must be equal)
    ${href}
    </a>
  `;

  return send({
    email,
    subject: 'Reset password',
    html,
  });
};

export const emailService = {
  send,
  sendActivationEmail,
  sendResetEmail,
};
