import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const send = async (email, subject, html) => {
  return transporter.sendMail({
    from: 'Auth API by PodvAx',
    to: email,
    subject,
    html,
  });
};

const sendActivationLink = async (email, activationToken) => {
  const link = `${process.env.CLIENT_URL}/auth/activate/${email}/${activationToken}`;
  const html = `
    <h1>Account activation in Auth App by PodvAx</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
};

const sendResetPasswordLink = async (email, resetToken) => {
  const link = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
  const html = `
    <h1>Reset password in Auth App by PodvAx</h1>
    <p>If you didn't request a password reset, please ignore this email.</p>
    <p>To reset your password, please click the link below:</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Reset password', html);
};

const sendPasswordChangedNotification = async (email) => {
  const html = `
    <h1>Password changed in Auth App by PodvAx</h1>
    <p>Your password has been changed successfully.</p>
  `;

  return send(email, 'Password changed', html);
};

const sendAttemptToChangeEmail = async (email, newEmail) => {
  const html = `
    <h1>Attempt to change email in Auth App by PodvAx</h1>
    <p>Someone attempted to change your email address. New email address is ${newEmail}</p>
  `;

  return send(email, 'Attempt to change email', html);
};

const sendEmailChangedNotification = async (email, newEmail) => {
  const html = `
    <h1>Email changed in Auth App by PodvAx</h1>
    <p>Your email address has been changed successfully. New email address is ${newEmail}</p>
  `;

  return send(email, 'Email changed', html);
};

const sendChangeEmailConfiramtion = async (email, activationToken) => {
  const link = `${process.env.CLIENT_URL}/profile/change-email/${activationToken}`;
  const html = `
    <h1>Change email in Auth App by PodvAx</h1>
    <p>To confirm the change of your email address, please click the link below:</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Change email confirmation', html);
};

export const mailer = {
  send,
  sendActivationLink,
  sendResetPasswordLink,
  sendPasswordChangedNotification,
  sendAttemptToChangeEmail,
  sendEmailChangedNotification,
  sendChangeEmailConfiramtion,
};

export default mailer;
