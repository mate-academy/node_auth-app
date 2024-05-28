import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
    text: '',
  });
};

const sendActivationLink = (email, token) => {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Activation link</h1>
      <a href="${link}" target="_blank">${link}</a>
    `,
  });
};

const sendConfirmation = (email, token) => {
  const link = `${process.env.CLIENT_URL}/profile/confirm-email/${token}`;

  return send({
    email,
    subject: 'Confirmation of email',
    html: `
      <h1>Confirmation's link</h1>
      <a href="${link}" target="_blank">${link}</a>
    `,
  });
};

const sendResetPassword = (email, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  return send({
    email,
    subject: 'Password reset',
    html: `
      <h1>Reset link</h1>
      <a href="${link}" target="_blank">${link}</a>
    `,
  });
};

export default {
  send,
  sendActivationLink,
  sendConfirmation,
  sendResetPassword,
};
