import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendActivationMail = async (to, link) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Account activation on our service',
    text: '',
    html: `
      <div>
        <h1>To activate your account, please follow the link.</h1>
        <a href="${link}">${link}</a>
      </div>
    `,
  });
};
