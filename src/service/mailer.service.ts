import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Send an email using async/await

const sendMail = async (
  to: string,
  html: string,
  subject: string = 'Activate your account',
) => {
  return transporter.sendMail({
    to: to,
    subject,
    html,
  });
};

export { sendMail };
