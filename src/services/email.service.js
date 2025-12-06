import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import 'dotenv/config';

const OAuth2 = google.auth.OAuth2;

async function createTransporter() {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessTokenObj = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'v.hulaievych@gmail.com',
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
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
  const href = `${process.env.CLIENT_HOST}/activate/${email}/${activationToken}`;
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
  }
}

export const emailService = {
  send,
  sendActivationEmail
}
