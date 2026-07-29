require('dotenv/config');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({ to: email, subject, html });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
  <h1>Activate Your Account</h1>
<p>Thank you for registering!</p>
<p>To complete your registration and activate your account, please click the button below.</p>

<p>
  <a
    href="${href}"
    style="
      display:inline-block;
      padding:12px 24px;
      background:#4F46E5;
      color:#ffffff;
      text-decoration:none;
      border-radius:6px;
      font-weight:bold;
    "
  >
    Activate Account
  </a>
</p>

<p>If the button doesn't work, copy and paste the following link into your browser:</p>
<p><a href="${href}">${href}</a></p>

<p>If you did not create this account, you can safely ignore this email.</p>
`;

  return send({
    email,
    html,
    subject: 'Activate',
  });
}

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/users/reset-email/${token}`;
  const html = `
 <h1>Reset Your Password</h1>

<p>We received a request to reset the password for your account.</p>

<p>Click the button below to create a new password.</p>

<p>
  <a
    href="${href}"
    style="
      display:inline-block;
      padding:12px 24px;
      background:#4F46E5;
      color:#ffffff;
      text-decoration:none;
      border-radius:6px;
      font-weight:bold;
    "
  >
    Reset Password
  </a>
</p>

<p>If the button doesn't work, copy and paste the following link into your browser:</p>

<p><a href="${href}">${href}</a></p>

<p>This password reset link will expire in 1 hour.</p>

<p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>`;

  return send({
    email,
    html,
    subject: 'Reset',
  });
}

function sendChangeEmailNotification(oldEmail) {
  const html = `
    <h1>Security Notification: Email Changed</h1>
    <p>The email address associated with your account was successfully changed.</p>
    <p>If you did NOT perform this action, please contact our support team immediately to secure your account.</p>
  `;

  return send({
    email: oldEmail,
    html,
    subject: 'Security Alert: Email address changed',
  });
}

const emailService = {
  send,
  sendActivationEmail,
  sendResetEmail,
  sendChangeEmailNotification,
};

module.exports = {
  send,
  emailService,
};
