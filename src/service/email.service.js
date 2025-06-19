/* eslint-disable no-console */
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

function send(email, subject, html) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationLink(email, activationToken, name) {
  const link = `${process.env.CLIENT_ADDRESS}/auth/activation/${name}/${activationToken}`;

  console.log(email);

  const html = `
    <h1>Account activation</h1>
    <p>Please click the link below to activate your account:</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

function sendChangeEmailLink(newEmail, changeEmailToken, name) {
  const link = `${process.env.CLIENT_ADDRESS}/auth/set-new-email/${name}/${changeEmailToken}`;

  const html = `
    <h1>Confirm Your New Email Address</h1>
    <a href="${link}">${link}</a>
  `;

  return send(newEmail, 'Confirm Your New Email', html);
}

function sendEmailChangeConfirmation(oldEmail, newEmail) {
  const subject = 'Email Change Confirmation';
  const html = `
    <h1>Email Change Confirmed</h1>
    <p>Your email address associated with your account has been successfully changed.</p>
    <p>Your previous email was: <strong>${oldEmail}</strong></p>
    <p>Your new email is: <strong>${newEmail}</strong></p>
  `;

  send(newEmail, subject, html);

  return send(oldEmail, subject, html);
}

function sendResetPasswordLink(email, resetPasswordToken, name) {
  const link = `${process.env.CLIENT_ADDRESS}/auth/reset-password/${name}/${resetPasswordToken}`;

  const html = `
    <h1>Reset Password</h1>
    <p>Click the link below to reset your password.</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Reset Password', html);
}

export const mailer = {
  send,
  sendActivationLink,
  sendResetPasswordLink,
  sendEmailChangeConfirmation,
  sendChangeEmailLink,
};
