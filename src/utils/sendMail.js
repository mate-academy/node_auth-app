/* eslint-disable no-console */
const nodemailer = require('nodemailer');

require('dotenv').config();

console.log('SMTP HOST:', process.env.SMTP_HOST);

const sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });

  return info;
};

module.exports = sendMail;
