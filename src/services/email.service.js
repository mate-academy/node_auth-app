import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function send({ email, subject, html }) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: subject,
    html: html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;

  const html = `
    <h1>Activate account</h1>
    <a href='${href}'>${href}</a>
  `;

  return send({
    email: email,
    subject: 'Activate your account',
    html: html,
  });
}

export const emailService = { send, sendActivationEmail };
