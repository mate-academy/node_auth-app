import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ie.panasovskyi@gmail.com',
    pass: 'cfrb sawq kdft dqob',
  },
});

async function send(email, subject, html) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

async function sendActivationEmail(email, activationToken) {
  const link = `${process.env.CLIENT_HOST}/auth/activation/${email}/${activationToken}`;
  const html = `
    <h1>Activation link</h1>
    <a href="${link}">${link}</a>
  `;

  await send(email, 'Activate your account', html);
}

async function sendPasswordChangeEmail(email, passwordChangeToken) {
  const link = `${process.env.CLIENT_HOST}/auth/passChange/${email}/${passwordChangeToken}`;
  const html = `
    <h1>Confirm password change</h1>
    <p>To change your current passport please click following link:
      <a href="${link}">${link}</a>
    </p>
  `;

  await send(email, 'Password change', html);
}

async function sendEmailChangeLetter(email, emailChangeToken) {
  const link = `${process.env.CLIENT_HOST}/auth/emailChange/${email}/${emailChangeToken}`;
  const html = `
    <h1>Confirm email change</h1>
    <p>To change your current email please click following link:
      <a href="${link}">${link}</a>
    </p>
  `;

  await send(email, 'Email change', html);
}

export const mailer = {
  sendActivationEmail,
  sendEmailChangeLetter,
  sendPasswordChangeEmail,
};
