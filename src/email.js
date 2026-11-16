// send email verification
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendEmail = async (to, subject, html) => {
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    html,
  });
};

const sendConfirmEmail = async (email, token) => {
  const href = `${process.env.CLIENT_HOST}activation/${token}`;
  const html = `
  <h1>Confirm your e-mail!</h1>
  <p>Please confirm your email within 20 minutes.</p>
  <a href="${href}">Confirm: ${href}</a>
  `;

  return sendEmail(email, 'confirm your email!', html);
};

export const emailService = {
  sendConfirmEmail,
  sendEmail,
};
