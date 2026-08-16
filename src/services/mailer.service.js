import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
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

function sendActivationLink(email, activationToken) {
  const link = `${process.env.CLIENT_URL}/activate/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

function sendUpdateEmail(email) {
  const html = `
    <h1>Email changed</h1>
    <p>Your profile email changed.</p>
  `;

  return send(email, 'Profile email changed', html);
}

function sendResetPasswordLink(email, resetPasswordJWT) {
  const link = `${process.env.CLIENT_URL}/reset-password/${resetPasswordJWT}`;
  const html = `
    <h1>Reset password link.</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Reset password link', html);
}

export const mailerService = {
  send,
  sendActivationLink,
  sendResetPasswordLink,
  sendUpdateEmail,
};
