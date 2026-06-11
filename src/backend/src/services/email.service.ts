import nodemailer from 'nodemailer';
import 'dotenv/config';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendActivationEmail(email: string, token: string) {
  const href = `http://${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}/activation?token=${token}`;
  const html = `
        <h1>Activate acount</h1>
        <a href="${href}">${href}</a>
    `;
  try {
    const info = await transporter.sendMail({
      from: '"Zhovtany Vladyslav fullstack App" <>', // sender address
      to: email, // list of recipients
      subject: 'Acount activation', // subject line
      text: 'Press this link to activate:', // plain text body
      html: html, // HTML body
    });

    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.error('Error while sending mail:', err);
  }
}

export async function sendEmail(
  to: string,
  content = { subject: 'Email was changed', text: '', html: '' },
) {
  try {
    const info = await transporter.sendMail({
      from: '"Zhovtany Vladyslav fullstack App" <>', // sender address
      to: to, // list of recipients
      subject: content.subject, // subject line
      text: content.text, // plain text body
      html: content.html, // HTML body
    });

    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.error('Error while sending mail:', err);
  }
}

export async function sendResetPasswordEmail(email: string, token: string) {
  const href = `http://${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}/password-reset/confirm?token=${token}`;
  const html = `
    <h1>Reset your password</h1>
    <a href="${href}">${href}</a>
  `;
  try {
    await transporter.sendMail({
      from: '"Zhovtany Vladyslav fullstack App" <>',
      to: email,
      subject: 'Password reset',
      text: 'Press this link to reset your password:',
      html,
    });
  } catch (err) {
    console.error('Error while sending mail:', err);
  }
}
