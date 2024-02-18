// import 'dotenv/config';
import nodemailer from 'nodemailer';

export const emailService = {
  send,
  sendActivationLink,
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html, text }) {
  return transporter.sendMail({
    from: 'Auth API', // sender address
    to: email,
    subject,
    text: text || '',
    html,
  });
}

export function sendActivationLink(email, token) {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Account activation</h1>
      <a href="${link}">${link}</a>
      `,
  });
}

// send({ email: process.env.SMTP_USER, text: 'Surprise, motherf*cker' })
//   .then(
//     (response) => console.info('Massege is send', response),
//     (error) => {
//       console.info('Something went wrong', error);
//     },
//   );
