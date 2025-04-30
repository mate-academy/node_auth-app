import nodemailer from 'nodemailer';

const { SMTP_SERVICE, SMTP_USER, SMTP_PASSWORD, CLIENT_URL } = process.env;

const transporter = nodemailer.createTransport({
  service: SMTP_SERVICE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

function send(email: string, subject: string, html: string) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

async function sendActivationLink(email: string, activationToken: string) {
  const link = `${CLIENT_URL}/activation/${activationToken}`;

  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  await send(email, 'Account activation', html);
}

async function sendResetPasswordLink(email: string, resetToken: string) {
  const link = `${CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
    <h1>Password Reset</h1>
    <a href="${link}">${link}</a>
  `;

  await send(email, 'Password Reset', html);
}

async function sendChangeEmailLink(email: string, token: string) {
  const link = `${CLIENT_URL}/change-email/${token}`;

  const html = `
    <h1>Email Changing</h1>
    <a href="${link}">${link}</a>
  `;

  await send(email, 'Email Verification', html);
}

async function sendEmailChangeNotification(email: string, newEmail: string) {
  const html = `<h1>Your email was changed to ${newEmail}</h1>`;

  await send(email, 'Email Change', html);
}

export const mailer = {
  send,
  sendActivationLink,
  sendChangeEmailLink,
  sendResetPasswordLink,
  sendEmailChangeNotification,
};
