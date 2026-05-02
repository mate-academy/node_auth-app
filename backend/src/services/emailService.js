/* eslint-disable no-console */
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendActivationEmail = async (user) => {
  try {
    const link = `http://localhost:3000/activate/${user.email}/${user.activationToken}`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Activate account',
      html: `
        <h2>Activate your account</h2>
        <p>Click the link below:</p>
        <a href="${link}">${link}</a>
      `,
    });

    console.log('EMAIL SENT:', info.messageId);
  } catch (err) {
    console.error('EMAIL ERROR:', err);
  }
};
