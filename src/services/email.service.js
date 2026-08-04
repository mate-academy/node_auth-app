import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;

  const html = `
    <h1>Activate your account</h1>
    <p>Click the link below to activate your account:</p>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Activate your account',
    html,
  });
}

function sendEmailChangeConfirmation(newEmail, token) {
  const href =
    `${process.env.API_HOST || 'http://localhost:3005'}` +
    `/users/profile/email/confirm/${token}`;

  const html = `
    <h1>Confirm your new email</h1>
    <p>Click the link below to confirm this email address:</p>
    <a href="${href}">${href}</a>
    <p>This link is valid for one hour.</p>
  `;

  return send({
    email: newEmail,
    subject: 'Confirm your new email',
    html,
  });
}

function sendOldEmailNotification(oldEmail, newEmail) {
  const html = `
    <h1>Your email address was changed</h1>
    <p>
      The email address for your account was changed
      from <strong>${oldEmail}</strong>
      to <strong>${newEmail}</strong>.
    </p>
    <p>
      If you did not make this change, contact support immediately.
    </p>
  `;

  return send({
    email: oldEmail,
    subject: 'Your email address was changed',
    html,
  });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  const html = `
    <h1>Reset your password</h1>
    <p>Click the link below to create a new password:</p>
    <a href="${href}">${href}</a>
    <p>This link is valid for one hour.</p>
  `;

  return send({
    email,
    subject: 'Reset your password',
    html,
  });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendEmailChangeConfirmation,
  sendOldEmailNotification,
  sendResetPasswordEmail,
};
