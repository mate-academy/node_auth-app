import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

export const sendActivationEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/auth/activate/${token}`;

  const html = `
    <h1>Activate account</h1>
    <a href="${href}">Activate</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate',
  });
};

export const sendResetPasswordEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/auth/set-new-password/${token}`;

  const html = `
    <h1>Reset Password</h1>
    <a href="${href}">Reset</a>
  `;

  return send({
    email,
    html,
    subject: 'Reset',
  });
};

export const sendActivationNewEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/user/activate-new-email/${token}`;

  const html = `
    <h1>Activate new email</h1>
    <a href="${href}">Activate</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate new email',
  });
};

export const sendChangedEmail = (oldEmail, newEmail) => {
  const html = `
    <h1>Email changed</h1>
    <p>Your email was changed to ${newEmail}</p>
  `;

  return send({
    email: oldEmail,
    html,
    subject: 'Changed email',
  });
};
