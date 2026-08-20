import nodemailer from 'nodemailer';
import 'dotenv/config';

let transporter = null;

const initTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
};

const send = async ({ from, to, subject, html }) => {
  const info = await transporter.sendMail({
    from: from || '"Auth Service" <noreply@authservice.com>',
    to,
    subject: subject || 'Unknown',
    html,
  });

  // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  return info;
};

const sendResetPasswordLink = async (email, token) => {
  transporter = await initTransporter();

  const link = `${process.env.CLIENT_URL}reset-password/${token}`;

  const html = `
    <h1>Reset password</h1>
    <a href="${link}">${link}</a>
  `;
  const subject = 'Reset password';

  return send({ to: email, subject, html });
};

const sendActivationLink = async (email, token) => {
  transporter = await initTransporter();

  const link = `${process.env.CLIENT_URL}activation/${token}`;

  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;
  const subject = 'Account activation';

  return send({ to: email, subject, html });
};

const sendEmailChangeLink = async (email, token) => {
  transporter = await initTransporter();

  const link = `${process.env.CLIENT_URL}change-email/${token}`;

  const html = `
    <h1>Confirm email changing</h1>
    <a href="${link}">${link}</a>
  `;
  const subject = 'Confirm email changing';

  return send({ to: email, subject, html });
};

export { send, sendEmailChangeLink, sendActivationLink, sendResetPasswordLink };
