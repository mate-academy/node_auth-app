import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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

function sendActivationLink(email: string, activationToken: string) {
  const link = `${process.env.CLIENT_URL}/activate/${email}/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <p>Click the link below to activate your account:</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

function sendPasswordReset(email: string, resetToken: string) {
  const link = `${process.env.CLIENT_URL}/reset-password/${email}/${resetToken}`;
  const html = `
    <h1>Password reset</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Password reset', html);
}

function sendEmailChangeNotification(email: string, newEmail: string) {
  const html = `
    <h1>Email change notification</h1>
    <p>Your email has been changed to: ${newEmail}</p>
  `;

  return send(email, 'Email change notification', html);
}

export const mailer = {
  send,
  sendActivationLink,
  sendPasswordReset,
  sendEmailChangeNotification,
};
