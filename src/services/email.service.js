const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendActivationEmail = async (email, activationToken) => {
  const activationLink = `${process.env.CLIENT_URL}/activation/${activationToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Activate your account',
    text: `Activate your account: ${activationLink}`,
    html: `
      <h1>Activate your account</h1>

      <p>Click the link below to activate your account:</p>

      <a href="${activationLink}">
        Activate account
      </a>
    `,
  });
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your password',
    text: `Reset your password: ${resetLink}`,
    html: `
      <h1>Reset your password</h1>

      <p>Click the link below to set a new password:</p>

      <a href="${resetLink}">
        Reset password
      </a>
    `,
  });
};

const sendEmailChangeConfirmation = async (email, emailChangeToken) => {
  const confirmationLink = `${process.env.CLIENT_URL}/confirm-email/${emailChangeToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirm your new email',
    text: `Confirm your new email: ${confirmationLink}`,
    html: `
      <h1>Confirm your new email</h1>

      <p>Click the link below to confirm your new email address:</p>

      <a href="${confirmationLink}">
        Confirm email
      </a>
    `,
  });
};

const sendEmailChangedNotification = async (oldEmail, newEmail) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: oldEmail,
    subject: 'Your email has been changed',
    text: `Your account email has been changed to ${newEmail}.`,
    html: `
      <h1>Email changed</h1>

      <p>
        Your account email has been changed to
        ${newEmail}.
      </p>
    `,
  });
};

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangeConfirmation,
  sendEmailChangedNotification,
};
