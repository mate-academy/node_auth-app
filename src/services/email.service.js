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

export const emailService = {
  send({ email, subject, html }) {
    return transporter.sendMail({
      to: email,
      subject,
      html,
    });
  },

  sendActivationEmail(email, token) {
    const href = `${process.env.CLIENT_HOST}/activation/${token}`;
    const subject = 'Activate';
    const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

    return this.send({ email, html, subject });
  },

  sendConfirmationEmail(email, token) {
    const href = `${process.env.CLIENT_HOST}/confirmation-email/${token}`;
    const subject = 'Confirmate';
    const html = `
  <h1>Confirmate email</h1>
  <a href="${href}">${href}</a>
  `;

    return this.send({ email, html, subject });
  },

  sendNotificationChangeEmail(email) {
    const subject = 'Email was changed';
    const html = `
    <h1>Email was changed</h1>
    <p>Your email was changed to <a href="mailto:${email}">${email}</a></p>
    `;

    return this.send({ email, html, subject });
  },

  sendResetPasswordEmail(email, token) {
    const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
    const subject = 'Reset password';
    const html = `
  <h1>Reset password</h1>
  <a href="${href}">${href}</a>
  `;

    return this.send({ email, html, subject });
  },
};
