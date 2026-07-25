'use strict';

const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (!transporter) {
    const account = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  }

  return transporter;
}

async function sendActivationEmail(email, activationToken) {
  const transport = await getTransporter();
  const port = process.env.PORT || 3000;
  const activationLink = `http://localhost:${port}/api/auth/activate/${activationToken}`;

  const info = await transport.sendMail({
    from: '"Auth App" <noreply@example.com>',
    to: email,
    subject: 'Activate your account',
    html: `<p>To activate your account, follow the link:</p>
      <a href="${activationLink}">${activationLink}</a>`,
  });

  // eslint-disable-next-line no-console
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
}

async function sendResetEmail(email, resetToken) {
  const transport = await getTransporter();
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const info = await transport.sendMail({
    from: '"Auth App" <noreply@example.com>',
    to: email,
    subject: 'Reset your password',
    html: `<p>To reset your password, follow the link:</p>
      <a href="${resetLink}">${resetLink}</a>`,
  });

  // eslint-disable-next-line no-console
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
}

async function sendEmailChangeNotification(oldEmail, newEmail) {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: '"Auth App" <noreply@example.com>',
    to: oldEmail,
    subject: 'Your email address has been changed',
    html: `<p>Your account email has been changed to <strong>${newEmail}</strong>.</p>
      <p>If you did not request this change, please contact support immediately.</p>`,
  });

  // eslint-disable-next-line no-console
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
}

module.exports = {
  sendActivationEmail,
  sendResetEmail,
  sendEmailChangeNotification,
};
