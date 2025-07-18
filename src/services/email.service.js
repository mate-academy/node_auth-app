import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMPT_HOST,
  port: process.env.SMPT_PORT,
  secure: false,
  auth: {
    user: process.env.SMPT_USER,
    pass: process.env.SMPT_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, html) {
  return send({ email, html, subject: 'Your Account' });
}

export const emailService = {
  send,
  sendActivationEmail,
};
