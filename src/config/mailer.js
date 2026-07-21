const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const send = (email, subject, html) => {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
};

const sendActivationLink = (email, activationToken) => {
  const link = `${process.env.CLIENT_URL}/auth/activate/${email}/${activationToken}`;
  const html = `
    <h1>Activate your account</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
};

const sendPasswordResetLink = (email, passwordResetToken) => {
  const link = `${process.env.CLIENT_URL}/auth/password-reset/${email}/${passwordResetToken}`;
  const html = `
    <h1>Reset your password</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Password reset', html);
};

module.exports = { send, sendActivationLink, sendPasswordResetLink };
