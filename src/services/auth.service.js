import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    servername: 'smtp.gmail.com',
  },
});

export const sendMail = ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: `Auth API <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: text ?? '',
    html,
  });
};

export const sendActivationMail = (email, token) => {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return sendMail({
    to: email,
    subject: 'Account activation',
    html: `<p>Press the link below to activate your account</p>
          <a href="${link}">${link}</a>`,
  });
};
