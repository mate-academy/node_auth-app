import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "testnodeapp2007@gmail.com",
    pass: "mpea ytsm lygv rpqr",
  }
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate Account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email, html, subject: 'Activate'
  })
}

export const emailService = {
  send,
  sendActivationEmail,
}
