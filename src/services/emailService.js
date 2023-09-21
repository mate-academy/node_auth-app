
import 'dotenv/config';

import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/userService';

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, CLIENT_URL,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    text: 'HTML doesn`t supported',
    html,
  });
};

const sendActivationLink = (email, token) => {
  const link = `${CLIENT_URL}/auth/activate/${token}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Account activation</h1>
      <a href="${link}" target="_blank">${link}</a>
    `,
  });
};

const sendEmailChanged = (email) => {
  return send({
    email,
    subject: 'Email reset',
    html: `
      <h1>This email was unlinked from account</h1>
    `,
  });
};

const changeEmail = async(email, newEmail) => {
  const user = await userService.findByEmail(email);

  const activationToken = uuidv4();

  user.email = newEmail;

  user.activationToken = activationToken;

  await sendActivationLink(newEmail, activationToken);
  await sendEmailChanged(email);
};

export const emailService = {
  send,
  sendActivationLink,
  sendEmailChanged,
  changeEmail,
};
