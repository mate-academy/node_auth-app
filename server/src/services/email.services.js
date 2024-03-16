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

async function send({ email, html }) {
  const info = await transporter.sendMail({
    to: email,
    subject: "Activation email",
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

  return await send({ email, html }).catch(console.error);
}

// sendActivationEmail("mokal65869@dovesilo.com", "111");

module.exports = { sendActivationEmail, send };
