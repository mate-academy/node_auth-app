const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendActivationEmail = async (to, token) => {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';

  try {
    const info = await transporter.sendMail({
      from: '"Example Team" <team@example.com>',
      to: to,
      subject: 'Activation link',
      text: `To activate your account click the link: ${baseUrl}/api/auth/activate/${token}`,
      html: `<a href="${baseUrl}/api/auth/activate/${token}">Click here to activate your account</a>`,
    });

    // eslint-disable-next-line no-console
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error while sending mail:', err);
  }
};

const sendPasswordResetEmail = async (to, token) => {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';

  try {
    const info = await transporter.sendMail({
      from: '"Example Team" <team@example.com>',
      to: to,
      subject: 'Password Reset Request',
      text: `To reset your password account click on this link: ${baseUrl}/api/auth/reset-password/${token}`,
      html: `<a href="${baseUrl}/api/auth/reset-password/${token}">Click here to reset your password</a>`,
    });

    // eslint-disable-next-line no-console
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error while sending mail:', err);
  }
};

const sendEmailChangedNotification = async (oldEmail) => {
  try {
    const info = await transporter.sendMail({
      from: '"Example Team" <team@example.com>',
      to: oldEmail,
      subject: 'Changed Email',
      text: `Your email has been changed`,
      html: `<a>Your email has been changed</a>`,
    });

    // eslint-disable-next-line no-console
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error while sending mail:', err);
  }
};

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangedNotification,
};
