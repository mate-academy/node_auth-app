/* eslint-disable no-console */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD,
  },
});

const send = async (email, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Auth API" <${process.env.MAILER_EMAIL}>`,
      to: email,
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);

    return info;
  } catch (error) {
    console.error(`Failed to send email: ${error.message}`);
    throw new Error('Failed to send email.');
  }
};

const sendActivationLink = async (email, activationToken) => {
  const link = `${process.env.CLIENT_URL}/activate/${email}/${activationToken}`;
  const html = `
    <h1>Account Activation</h1>
    <p>Please click the link below to activate your account:</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account Activation', html);
};

module.exports = {
  send,
  sendActivationLink,
};
