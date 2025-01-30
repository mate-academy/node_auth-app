import nodemailer from 'nodemailer';

import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const send = async ({ email, html, subject }) => {
  return transporter.sendMail({
    to: email,
    html,
    subject,
  });
};

const sendActivationEmail = async (email, token) => {
  const activationLink = `${process.env.CLIENT_HOST}/auth/activation/${email}/${token}`;
  const subject = 'Activate your profile';

  const html = `
  <h1>${subject}</h1>
  <a href=${activationLink}>${activationLink}</a>
  `;

  return send({
    email,
    html,
    subject,
  });
};

const sendResetPassword = async (email, resetToken) => {
  const resetPasswordLink = `${process.env.CLIENT_HOST}/auth/reset/${resetToken}`;
  const subject = 'Reset your password using this link';

  const html = `
  <h1>${subject}</h1>
  <a href=${resetPasswordLink}>${resetPasswordLink}</a>
  `;

  return send({
    email,
    html,
    subject,
  });
};

const changeEmailNotification = async (email, newEmail) => {
  const subject = `Your profile email at WanWan.com was changed to ${newEmail},
     if it wasnt you - login into your profile and change password
     or submit a ticket to support`;
  const html = `
  <h1>${subject}</h1>
  `;

  return send({
    email,
    html,
    subject,
  });
};

const notifyNewEmail = async (newEmail) => {
  const subject = `Your email was linked to profile at WanWan.com,
    if it wasnt you - submit a ticket to support.`;
  const html = `
  <h1>${subject}</h1>
  `;

  return send({
    email: newEmail,
    html,
    subject,
  });
};

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPassword,
  changeEmailNotification,
  notifyNewEmail,
};
