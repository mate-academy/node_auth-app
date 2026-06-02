import nodemailer from 'nodemailer';

const testAccount = await nodemailer.createTestAccount();

// console.log(testAccount);

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});

export async function send({ email, subject, html }) {
  const info = await transporter.sendMail({
    to: email,
    subject,
    html,
  });

  // console.log(info.messageId);

  // console.log(nodemailer.getTestMessageUrl(info));

  return info;
}

function sendActivationEmail(email, activationToken) {
  const href = `http://localhost:3005/activation/${activationToken}`;
  const html = `
<h1>Activate your account</h1>
<a href="${href}">${href}</a>`;

  return send({ email, html, subject: 'Activate your account' });
}

function sendResetPasswordMail(email, resetToken) {
  const href = `http://localhost:3005/reset-password/${resetToken}`;
  const html = `
<h1>Reset your password</h1>
<a href="${href}">${href}</a>`;

  return send({ email, html, subject: 'Reset your password' });
}

export const emailService = {
  sendActivationEmail,
  send,
  sendResetPasswordMail,
};
