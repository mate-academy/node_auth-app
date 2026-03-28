import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

const sendActivationEmail = (name, email, token) => {
  const activationLink = `${process.env.CLIENT_HOST}/activate/${token}`;
  const subject = 'Account Activation';
  const html = `
    <h1>Activate your account, ${name}</h1>
    <p>Please click the link below to activate your account:</p> 
    <a href="${activationLink}">${activationLink}</a>
  `;

  return send({ email, subject, html });
};

const sendResetPasswordEmail = (name, email, token) => {
  const resetLink = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const subject = 'Password Reset';
  const html = `
    <h1>Password Reset Request, ${name}</h1>
    <p>Please click the link below to reset your password:</p> 
    <a href="${resetLink}">${resetLink}</a>
  `;

  return send({ email, subject, html });
};

const sendChangeEmailNotification = (name, email) => {
  const subject = 'Email Change Notification';
  const html = `
    <h1>Email Change Notification, ${name}</h1>
    <p>Your email has been successfully changed.</p>
  `;

  return send({ email, subject, html });
};

const sendActivationNewEmail = (name, email, token) => {
  const activationLink = `${process.env.CLIENT_HOST}/activate-new-email/${token}`;
  const subject = 'New Email Activation';
  const html = `
    <h1>Activate your new email, ${name}</h1>
    <p>Please click the link below to activate your new email:</p> 
    <a href="${activationLink}">${activationLink}</a>
  `;

  return send({ email, subject, html });
};

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendChangeEmailNotification,
  sendActivationNewEmail,
};
