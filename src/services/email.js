'use strict';

const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

async function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (config.nodeEnv === 'test') {
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });

    return transporter;
  }

  if (config.smtp.user && config.smtp.pass) {
    try {
      const testTransport = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });

      await testTransport.verify();
      transporter = testTransport;

      return transporter;
    } catch {
      // eslint-disable-next-line no-console
      console.log(
        'SMTP credentials invalid, ' +
          'falling back to Ethereal test account...',
      );
    }
  }

  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Ethereal test account created: ${testAccount.user}`);
  // eslint-disable-next-line no-console
  console.log('View emails at https://ethereal.email/login');

  return transporter;
}

async function sendActivationEmail(email, activationToken) {
  const transport = await getTransporter();
  const activationUrl = `${config.baseUrl}/auth/activate/${activationToken}`;

  const info = await transport.sendMail({
    from: '"Auth App" <noreply@authapp.com>',
    to: email,
    subject: 'Activate your account',
    html: `
      <h2>Welcome!</h2>
      <p>Please activate your account by clicking the link below:</p>
      <a href="${activationUrl}">Activate Account</a>
      <p>Or copy this link: ${activationUrl}</p>
    `,
  });

  logPreviewUrl(info);

  return info;
}

async function sendPasswordResetEmail(email, resetToken) {
  const transport = await getTransporter();
  const resetUrl = `${config.baseUrl}/password/reset/${resetToken}`;

  const info = await transport.sendMail({
    from: '"Auth App" <noreply@authapp.com>',
    to: email,
    subject: 'Password Reset',
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click the link below:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>Or copy this link: ${resetUrl}</p>
      <p>If you did not request this, ignore this email.</p>
    `,
  });

  logPreviewUrl(info);

  return info;
}

async function sendEmailChangeNotification(oldEmail, newEmail) {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: '"Auth App" <noreply@authapp.com>',
    to: oldEmail,
    subject: 'Your email has been changed',
    html: `
      <h2>Email Changed</h2>
      <p>Your email address has been changed from ${oldEmail}
        to ${newEmail}.</p>
      <p>If you did not make this change, contact support.</p>
    `,
  });

  logPreviewUrl(info);

  return info;
}

async function sendNewEmailConfirmation(newEmail) {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: '"Auth App" <noreply@authapp.com>',
    to: newEmail,
    subject: 'Email change confirmation',
    html: `
      <h2>Email Change Confirmed</h2>
      <p>Your email has been successfully updated to ${newEmail}.</p>
    `,
  });

  logPreviewUrl(info);

  return info;
}

function logPreviewUrl(info) {
  if (nodemailer.getTestMessageUrl(info)) {
    // eslint-disable-next-line no-console
    console.log(`Preview email: ${nodemailer.getTestMessageUrl(info)}`);
  }
}

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangeNotification,
  sendNewEmailConfirmation,
  getTransporter,
};
