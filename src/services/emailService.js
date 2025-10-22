const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendActivationEmail({ to, name, activationLink }) {
  const html = `
    <p>Olá, ${name}!</p>
    <p>Bem-vindo(a). Para ativar sua conta, clique no link abaixo:</p>
    <p><a href="${activationLink}" target="_blank" rel="noopener noreferrer">${activationLink}</a></p>
    <p>Se você não solicitou este cadastro, ignore este e-mail.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: 'Ative sua conta',
    html,
  });
}

module.exports = { sendActivationEmail };
