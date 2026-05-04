import nodemailer from 'nodemailer';

const CLIENT_URL = 'http://localhost:3000';
const PLACEHOLDER_SMTP_PASSWORD = 'your_application_password_from_gmail';

const buildActivationUrl = (activationToken: string) => {
  const baseUrl = (process.env.CLIENT_URL || CLIENT_URL).replace(/\/+$/, '');

  return `${baseUrl}/activate/${activationToken}`;
};

const buildPasswordResetUrl = (passwordResetToken: string) => {
  const baseUrl = (process.env.CLIENT_URL || CLIENT_URL).replace(/\/+$/, '');

  return `${baseUrl}/password-reset/confirm/${passwordResetToken}`;
};

const canUseSmtp = () => {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_PASSWORD !== PLACEHOLDER_SMTP_PASSWORD,
  );
};

export const sendActivationEmail = async (
  email: string,
  activationToken: string,
): Promise<void> => {
  const activationUrl = buildActivationUrl(activationToken);

  if (!canUseSmtp()) {
    // eslint-disable-next-line no-console
    console.log(`Activation link for ${email}: ${activationUrl}`);

    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Activate your account',
    text: `Activate your account: ${activationUrl}`,
    html: `<p>Activate your account:</p><p><a href="${activationUrl}">${activationUrl}</a></p>`,
  });
};

export const sendEmailChangeNotification = async (
  oldEmail: string,
  newEmail: string,
): Promise<void> => {
  if (!canUseSmtp()) {
    // eslint-disable-next-line no-console
    console.log(`Email changed from ${oldEmail} to ${newEmail}`);

    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: oldEmail,
    subject: 'Your email was changed',
    text: `Your account email has been changed to ${newEmail}.`,
    html: `<p>Your account email has been changed to <strong>${newEmail}</strong>.</p>`,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  passwordResetToken: string,
): Promise<void> => {
  const passResetUrl = buildPasswordResetUrl(passwordResetToken);

  if (!canUseSmtp()) {
    // eslint-disable-next-line no-console
    console.log(`Password reset link for ${email}: ${passResetUrl}`);

    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your password change link',
    text: `Change your password: ${passResetUrl}`,
    html: `<p>Go to confirm password change page:</p><p><a href="${passResetUrl}">${passResetUrl}</a></p>`,
  });
};
