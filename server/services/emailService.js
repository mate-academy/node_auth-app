import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    html: `
      <h2>Password reset</h2>

      <p>
        Click the link below to reset your password:
      </p>

      <a href="${resetUrl}">
        Reset password
      </a>

      <p>
        This link will expire in 15 minutes.
      </p>
    `,
  });
};

export const sendActivationEmail = async (email, token) => {
  const activationUrl = `${FRONTEND_URL}/activate/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Activate your account',
    html: `
      <h2>Welcome!</h2>

      <p>Click the link below to activate your account:</p>

      <a href="${activationUrl}">
        Activate account
      </a>
    `,
  });
};

export const sendConfirmNewEmail = async (newEmail, token) => {
  const confirmUrl = `${FRONTEND_URL}/change-email/${token}`;

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: newEmail,
    subject: 'Confirm your new email',
    html: `
      <h2>Confirm your new email</h2>

      <p>
        You requested to change your email address.
      </p>

      <p>
        Click the button below to confirm your new email:
      </p>

      <a href="${confirmUrl}">
        Confirm new email
      </a>

      <p>
        This link will expire in 15 minutes.
      </p>
    `,
  });
};

export const sendEmailChangedNotification = async (oldEmail, newEmail) => {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: oldEmail,
    subject: 'Your email has been changed',
    html: `
      <h2>Email changed</h2>

      <p>
        Your account email has been changed.
      </p>

      <p>
        New email: <strong>${newEmail}</strong>
      </p>

      <p>
        If you did not make this change,
        please contact support.
      </p>
    `,
  });
};
