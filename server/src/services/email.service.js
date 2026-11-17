import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f6f8fb; border-radius: 12px;">
      <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 16px;">
        👋 Welcome!
      </h1>

      <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
        Thanks for signing up! Please confirm your email to activate your account.
      </p>

      <a href="${href}"
         style="display: inline-block; padding: 14px 28px; background: #22c55e; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px;">
        ✅ Activate account
      </a>

      <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 24px 0 0;">
        If the button doesn't work, copy this link into your browser:<br>
        <a href="${href}" style="color: #3b82f6; word-break: break-all;">${href}</a>
      </p>

      <p style="color: #9ca3af; font-size: 13px; margin: 16px 0 0;">
        If you didn't create an account, just ignore this email.
      </p>
    </div>
  `;

  return send({
    email,
    subject: 'Activate your account',
    html,
  });
}

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f5f7; padding: 40px 0;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; text-align: center;">
        <h1 style="margin: 0 0 16px; font-size: 24px; color: #1f2937;">
          Reset your password
        </h1>

        <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563; line-height: 1.5;">
          We received a request to reset your password.
          Click the button below to choose a new one.
        </p>

        <a
          href="${href}"
          style="display: inline-block; padding: 14px 28px; background: #ef4444; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;"
        >
          Reset password
        </a>

        <p style="margin: 24px 0 8px; font-size: 13px; color: #9ca3af;">
          If the button doesn't work, copy this link:
        </p>

        <a href="${href}" style="font-size: 13px; color: #3b82f6; word-break: break-all;">
          ${href}
        </a>

        <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af;">
          If you didn't request a password reset, just ignore this email.
          Your password will stay the same.
        </p>
      </div>
    </div>
  `;

  return send({
    email,
    subject: 'Reset your Password',
    html,
  });
}

export const emailService = {
  sendActivationEmail,
  sendResetEmail,
  send,
};
