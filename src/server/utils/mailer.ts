import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
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
  const link = `${process.env.CLIENT_URL}/auth/activation/${email}/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

function sendResetPasswordLink(email: string, resetToken: string) {
  const link = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `
    <h1>Reset password</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Password reset', html);
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@');

  if (!name || !domain) {
    return email;
  }

  const maskedName =
    name.length > 1 ? name[0] + '*'.repeat(name.length - 1) : name[0] + '*';

  return `${maskedName}@${domain}`;
}

function sendEmailChangeNotification(email: string, newEmail: string) {
  const html = `
    <h1>Hello!</h1>
    <p>The email address for your account has been successfully changed.</p>
    <br/>
    <p>Previous email: ${email}</p>
    <p>New email: ${maskEmail(newEmail)}</p>
  `;

  return send(email, 'Your email address has been changed', html);
}

export const mailer = {
  send,
  sendActivationLink,
  sendResetPasswordLink,
  sendEmailChangeNotification,
};
