import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  return transporter.sendMail({
    from: 'Auth API', // sender address
    to: email,
    subject,
    text: '',
    html,
  });
}

export function sendActivationLink(email, token) {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Account activation</h1>
      <a href="${link}">${link}</a>
    `,
  });
}


export function sendPasswordResetLink(email, token) {
  const link = `${process.env.CLIENT_URL}/password-reset/${token}`;

  return send({
    email,
    subject: 'Password reset',
    html: `
      <h1>Password reset</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

export function sendEmailChangeConfirmation(newEmail, token) {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return send({
    email: newEmail,
    subject: 'Confirm your new email address',
    html: `
      <h1>Confirm email change</h1>
      <p>Click the link below to confirm your new email address:</p>
      <a href="${link}">${link}</a>
    `,
  });
}

export function sendEmailChangeNotification(oldEmail, newEmail) {
  return send({
    email: oldEmail,
    subject: 'Your email address has been changed',
    html: `
      <h1>Email address change requested</h1>
      <p>A request was made to change your account email to <strong>${newEmail}</strong>.</p>
      <p>If you did not request this change, please contact support immediately.</p>
    `,
  });
}

export const emailService = {
  send,
  sendActivationLink,
  sendPasswordResetLink,
  sendEmailChangeConfirmation,
  sendEmailChangeNotification,
};
