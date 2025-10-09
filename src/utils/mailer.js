import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendActivationEmail = async (toEmail, activationLink) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: 'Ativação de conta',
    html: `
      <p>Obrigado por se registrar!</p>
      <p>Para ativar sua conta, siga este link:</p>
      <a href="${activationLink}">${activationLink}</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};
