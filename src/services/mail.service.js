import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: `Node Auth App <${process.env.SMTP_FROM}>`,
    to,
    subject,
    text: text ?? '',
    html,
  });
};

export const sendActivationEmail = (to, token) => {
  const link = `http://${process.env.API_HOST}:${process.env.API_PORT}/activate/${token}`;

  return sendEmail({
    to,
    subject: 'Activate your account',
    text: `Activate your account by clicking here: ${link}`,
    html: `
      <h1>Activate your account</h1>
      <p>
        <a href="${link}">${link}</a>
      </p>
    `,
  });
};
