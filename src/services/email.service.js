const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendActivation(token, email) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Activate your account',
    html: `<b>Click link below to activate your account</b>\n<a href='' target='blank'>${process.env.URL}/auth/activate/${token}</a>`,
  });
}

async function sendResetPassword(token, email) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset password',
    html: `<b>Click link below reset your password</b>\n<a href='' target='blank'>${process.env.URL}/reset/password/token/${token}</a>`,
  });
}

async function sendNewEmailActivation(token, email) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Change email',
    html: `<b>Click link below to change your email</b>\n<a href='' target='blank'>${process.env.URL}/profile/activateEmail/${token}</a>`,
  });
}

async function notifyOldEmail(email) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your email has been changed',
    html: `Email on your account has been changed`,
  });
}

module.exports = {
  sendActivation,
  sendResetPassword,
  sendNewEmailActivation,
  notifyOldEmail,
};
