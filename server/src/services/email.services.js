require("dotenv/config");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function send({ email, html, subject }) {
  const info = await transporter.sendMail({
    to: email,
    subject,
    html,
  });

  console.log("Message sent: %s", info.messageId);
}

async function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_URL}/activate/${token}`;

  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  const subject = "Activation email";

  return await send({ email, html, subject }).catch(console.error);
}

async function sendPasswordResetEmail(email, token) {
  const href = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const html = `
  <h1>Change password by link below</h1>
  <a href="${href}">${href}</a>
  `;

  const subject = "Password recovering";

  return await send({ email, html, subject }).catch(console.error);
}

module.exports = { sendActivationEmail, sendPasswordResetEmail, send };
