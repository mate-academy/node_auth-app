import nodemailer from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER as string;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD as string;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export function send(email: string, subject: string, html: string) {
  return transporter.sendMail({
    from: '"Auth API" <nodejs.auth.api@gmail.com>',
    to: email,
    subject,
    html,
  });
}

export function sendActivationLink(email: string, activationToken: string) {
  const link = `${process.env.CLIENT_URL}/activate/${email}/${activationToken}`;

  const html = `
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #333;">Welcome to Auth API!</h2>
      <p>Thank you for registering. Please click the button below to activate your account:</p>
      <div style="margin: 24px 0;">
        <a href="${link}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
          Activate Account
        </a>
      </div>
      <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; color: #0066cc; word-break: break-all;"><a href="${link}">${link}</a></p>
    </div>
  `;

  return send(email, 'Account activation', html);
}

export function sendResetLink(email: string, resetToken: string) {
  const link = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `<h1>Password Reset</h1><a href="${link}">Reset Password</a>`;

  return send(email, 'Password Reset Request', html);
}

export function sendEmailChangeNotification(oldEmail: string) {
  const html = `<h1>Email Changed</h1><p>Your account email has been changed.</p>`;

  return send(oldEmail, 'Security Notification: Email Changed', html);
}

export const mailer = {
  send,
  sendActivationLink,
  sendResetLink,
  sendEmailChangeNotification,
};
