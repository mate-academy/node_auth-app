import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const send = (email, subject, html) => {
  return transporter.sendMail({
    from: `"Auth API" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
};

export const sendActivationLink = async (email, activationToken) => {
  const link = `${process.env.CLIENT_URL}/auth/activation/${email}/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
};

export const sendResetLink = (email, resetToken) => {
  const link = `${process.env.CLIENT_URL}/auth/reset-password/${email}/${resetToken}`;
  const html = `
    <h1>Reset link</h1>
    <p>Click the link below to reset your password</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Password reset', html);
};

export const sendChangeEmailNotification = (oldEmail, newEmail) => {
  const html = `
    <h1>Email changed</h1>
    <p>Your email has been changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
    <p>If you didn't make this change, please contact support team immediately.</p>
  `;

  return send(oldEmail, 'Your email has been changed', html);
};

export const mailer = {
  send,
  sendActivationLink,
  sendResetLink,
  sendChangeEmailNotification,
};
