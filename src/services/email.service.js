/* eslint-disable no-console */

import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import 'dotenv/config';
import { ApiError } from '../exceptions/api.error.js';
import { emailConfig } from '../config/email.config.js';

const OAuth2 = google.auth.OAuth2;

async function createTransporter() {
  const oauth2Client = new OAuth2({ ...emailConfig });

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessTokenObj = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'v.hulaievych@gmail.com',
      emailConfig,
      accessToken: accessTokenObj.token,
    },
  });

  return transporter;
}

async function send({ email, subject, html }) {
  const transporter = await createTransporter();

  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

async function sendActivationEmail(email, activationToken) {
  const href = `${process.env.CLIENT_HOST}/activate?token=${activationToken}`;
  const subject = 'Activation account';
  const html = `
    <h1>activation</h1>
    <a href="${href}">${href}</a>
  `;

  try {
    await send({ email, subject, html });
    console.log('✅ Activation email sent to', email);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw ApiError.badRequest('Server problem', error);
  }
}

async function sendResetPasswordEmail(email, resetPasswordToken) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${email}/${resetPasswordToken}`;
  const subject = 'Reset your password';
  const html = `
    <h1>Reset your password</h1>
    <a href="${href}">${href}</a>
  `;

  try {
    await send({ email, subject, html });
    console.log('✅ Reset password email sent to', email);
  } catch (error) {
    throw ApiError.badRequest('Error sending email:', error.message);
  }
}

async function sendChangedEmail(email) {
  const subject = 'Email changed';
  const html = `
    <h1>Your email has been change to ${email}</h1>
  `;

  try {
    await send({ email, subject, html });
    console.log('✅ Email has been change', email);
  } catch (error) {
    throw ApiError.badRequest('Error sending email:', error.message);
  }
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendChangedEmail,
};
