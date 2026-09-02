import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, html }) {
  await transporter.sendMail({
    from: `"Auth App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`Email sent to ${to}`);
}

export function sendActivationEmail(email, activationToken) {
  const link = `${process.env.CLIENT_URL}/activate/${activationToken}`;

  return sendMail({
    to: email,
    subject: 'Activate your account',
    html: `<p>Click the link below to activate your account:</p><p><a href="${link}">${link}</a></p>`,
  });
}

export function sendPasswordResetEmail(email, resetToken) {
  const link = `${process.env.CLIENT_URL}/reset-password/confirm/${resetToken}`;

  return sendMail({
    to: email,
    subject: 'Reset your password',
    html: `<p>Click the link below to choose a new password:</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, ignore this email.</p>`,
  });
}

export function sendEmailChangeConfirmation(newEmail, token) {
  const link = `${process.env.API_URL}/users/me/email/confirm/${token}`;

  return sendMail({
    to: newEmail,
    subject: 'Confirm your new email address',
    html: `<p>Click the link below to confirm this is your new email address:</p><p><a href="${link}">${link}</a></p>`,
  });
}

export function sendEmailChangeNotice(oldEmail, newEmail) {
  return sendMail({
    to: oldEmail,
    subject: 'Your email address is being changed',
    html: `<p>Someone requested to change the email on your account to <strong>${newEmail}</strong>. If this wasn't you, contact support immediately.</p>`,
  });
}
