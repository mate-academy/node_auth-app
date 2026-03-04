import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const send = (email: string, subject: string, html: string) => {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
};

export const sendActivationLink = async (
  email: string,
  activationToken: string,
) => {
  const link = `${process.env.CLIENT_URL}/auth/activation/${email}/${activationToken}`;
  const html = `
  <h1>Account activation</h1>
  <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
};

export const sendResetLink = (email: string, resetToken: string) => {
  const link = `${process.env.CLIENT_URL}/auth/reset-password/${email}/${resetToken}`;
  const html = `
    <h1>Reset link</h1>
    <p>Click the link below to reset your password</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Password reset', html);
};

export const sendEmailChangeNotification = (
  oldEmail: string,
  newEmail: string,
) => {
  const html = `
    <h1>Email Changed</h1>
    <p>Your email has been changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
    <p>If you did not make this change, please contact support immediately.</p>
  `;

  return send(oldEmail, 'Your email has been changed', html);
};
