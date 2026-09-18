const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const send = async ({ email, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject,
      html,
    });

    return info;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error while sending mail:', err);
  }
};

const sendActivationEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
    <h1>Activate acoutn</h1>
    <a href=${href}>${token}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate',
  });
};

const sendResetPassword = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
    <h1>Reset Password</h1>
    <a href=${href}>${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Reset password',
  });
};

const sendAfterChangeEmail = (email, newEmail) => {
  const html = `
      <h2 style="color: #444;">Your account email has been changed</h2>
    <p>Hello,</p>
    <p>We want to let you know that the email address linked to your account has been successfully updated.</p>

    <p style="background-color:#f0f0f0; padding:10px; border-radius:4px;">
      <strong>Old email:</strong> ${email}<br>
      <strong>New email:</strong> ${newEmail}
    </p>

    <p>If you did not request this change, please contact our support team immediately to secure your account.</p>

    <p>Thank you,<br>
    The Support Team</p>

    <p style="font-size:0.9em; color:#777;">This is an automated message. Please do not reply directly to this email.</p>
  `;

  return send({
    email,
    html,
    subject: 'Your account email has been changed',
  });
};

const emailService = {
  send,
  sendActivationEmail,
  sendResetPassword,
  sendAfterChangeEmail,
};

module.exports = { emailService };
