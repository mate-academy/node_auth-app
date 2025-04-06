import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD,
  },
});

async function send(email, subject, html) {
  console.log(
    `--------------ACTIVATE MAILER SEND | EMAIL: ${email}; THEMA: ${subject}; HTML: ${html}---------------`,
  );

  try {
    return await transporter.sendMail({
      from: `"Auth API" <${process.env.MAILER_USER}>`,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

function generateActivateLink(activationToken) {
  const link = `http://localhost:5700/auth/activation/${activationToken}`;

  return `
  <h1>Activation list</h1>
  <h2>Click to link bellow for activation your account</h2>
  <a href='${link}'>${link}</a>`;
}

function generateAproveLink(method, value) {
  if (method === 'email' || method === 'password') {
    const link = `http://localhost:5700/auth/${method}/${value}`;

    return `
  <h1>Confirm your ${method} change</h1>
  <h2>Please click on the link below to confirm your ${method} change.</h2>
  <a href='${link}'>${link}</a>`;
  } else {
    console.error('Unexpected generate link method');
  }
}

export const mailService = {
  send,
  generateActivateLink,
  generateAproveLink,
};
