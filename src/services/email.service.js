const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendActivationEmail(email, name, activationToken) {
  const activationLink = `${process.env.SERVER_URL}/auth/activation/${email}/${activationToken}`;

  const mailOptions = {
    from: `Auth Service <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Account registration',
    html: getActivationEmailHtml(name, activationLink),
  };

  await transporter.sendMail(mailOptions);
}

function getActivationEmailHtml(name, activationLink) {
  return `
    <h1>Hello, ${name}!</h1>
    <p>Thank you for registering.</p>
    <a href="${activationLink}">
      Activate account
    </a>
    <p>If you did not visit our website, please ignore this message.</p>
  `;
}

async function sendResetPasswordEmail(email, name, resetPasswordToken) {
  const resetPasswordLink = `${process.env.SERVER_URL}/auth/reset-password/${email}/${resetPasswordToken}`;

  const mailOptions = {
    from: `Auth Service <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset password',
    html: getResetPasswordEmailHtml(name, resetPasswordLink),
  };

  await transporter.sendMail(mailOptions);
}

function getResetPasswordEmailHtml(name, resetPasswordLink) {
  return `
    <h1>Hello, ${name}!</h1>

    <p>Someone requested a password reset.
      If it was you, click the link below.
      If not, ignore this email.
    </p>

    <a href="${resetPasswordLink}">
      Reset password
    </a>
  `;
}

function getEmailChangeHtml(name, emailChangeLink) {
  return `
    <h1>Hello, ${name}!</h1>

    <p>Someone requested to change the email address for your account.
      If it was you, confirm the new email by clicking the link below.
      If it wasn't you, ignore this message.
    </p>

    <a href="${emailChangeLink}">
      Confirm new email
    </a>
  `;
}

async function sendEmailChange(pendingEmail, name, emailChangeToken) {
  const emailChangeLink = `${process.env.SERVER_URL}/auth/change-email/${pendingEmail}/${emailChangeToken}`;

  const mailOptions = {
    from: `Auth Service <${process.env.EMAIL_USER}>`,
    to: pendingEmail,
    subject: 'Confirm new email',
    html: getEmailChangeHtml(name, emailChangeLink),
  };

  await transporter.sendMail(mailOptions);
}

function getEmailChangedNotificationHtml(name) {
  return `
    <h1>Hello, ${name}!</h1>

    <p>
      Your email address has been successfully changed.

      If you did not perform this action,
      please contact support immediately.
    </p>
  `;
}

async function sendEmailChangedNotification(oldEmail, name) {
  const mailOptions = {
    from: `Auth Service <${process.env.EMAIL_USER}>`,
    to: oldEmail,
    subject: 'Your email address has been changed',
    html: getEmailChangedNotificationHtml(name),
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChange,
  sendEmailChangedNotification,
};
