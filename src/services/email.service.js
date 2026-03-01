import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    text: '',
    html,
  });
}

function sendActivationLink(email, token) {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Account activation</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

function sendResetPasswordLink(email, token) {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  return send({
    email,
    subject: 'Password reset',
    html: `
      <h1>Password reset</h1>
      <p>Click the link below to reset your password. It is valid for 15 minutes.</p>
      <a href="${link}">${link}</a>
    `,
  });
}

function sendEmailChangeNotice(email) {
  return send({
    email,
    subject: 'Security Alert: Email Changed',
    html: `
    <h1> Email Change Notification</h1>
    <p>Your account email has been successfully changed. If you did not authorize this action, please contact support immediately.</p>
    `,
  });
}

export const emailService = {
  send,
  sendActivationLink,
  sendResetPasswordLink,
  sendEmailChangeNotice,
};
