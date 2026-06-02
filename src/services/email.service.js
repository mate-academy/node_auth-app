import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function send(email, subject, html) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
    <h1>Activate</h1>
    <a href="${href}">${href}</a>
  `;

  return send(email, 'Activate', html);
}

function sendNotifyEmail(email) {
  const html = `
    <h1>Your email has been changed</h1>
  `;

  return send(email, 'Your email has been changed', html);
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/password/reset/${token}`;
  const html = `
    <h1>Reset password</h1>
    <a href="${href}">${href}</a>
  `;

  return send(email, 'Reset password', html);
}

function sendChangeEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/user/profile/email/change/activation/${token}`;
  const html = `
    <h1>Confirm change email</h1>
    <a href="${href}">${href}</a>
  `;

  return send(email, 'Confirm change email', html);
}

export const mailer = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendNotifyEmail,
  sendChangeEmail,
};
