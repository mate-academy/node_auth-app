const nodemailer = require('nodemailer');

require('dotenv/config');

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

const sendMail = async ({ to, subject, text, html }) => {
  const result = await transporter.sendMail({
    from: 'Auth API <olaf4402@gmail.com>',
    to,
    subject,
    text: text || '',
    html,
  });

  if (!result.accepted.length) {
    throw new Error('Could not send the activation email');
  }

  return result.accepted;
};

const sendActivationMail = (email, token) => {
  const activationLink = `${process.env.REACT_APP_ORIGIN}/activate/${token}`;

  return sendMail({
    to: email,
    subject: 'Account activation',
    html: `
      <h1>Visit the link below to activate your account</h1>
      <a target="_blank" href=${activationLink}>${activationLink}</a>
    `,
  });
};

const sendResetMail = (email, resetToken) => {
  const resetLink = `${process.env.REACT_APP_ORIGIN}/reset/${resetToken}`;

  return sendMail({
    to: email,
    subject: 'Password Reset',
    html: `
      <h1>Visit the link below to reset your password</h1>
      <a target="_blank" href=${resetLink}>${resetLink}</a>
    `,
  });
};

const sendResetMailConfirmation = (email) => {
  return sendMail({
    to: email,
    subject: 'Password reset confirmation',
    html: `
      <h1>Your password has been changed successfully</h1>
    `,
  });
};

const sendEmailChangeConfirmation = (oldEmail) => {
  return sendMail({
    to: oldEmail,
    subject: 'Email change confirmation',
    html: `
      <h1>This email address previously assigned to your account has been changed successfully</h1>
    `,
  });
};

module.exports = {
  sendMail,
  sendActivationMail,
  sendResetMail,
  sendResetMailConfirmation,
  sendEmailChangeConfirmation,
};
