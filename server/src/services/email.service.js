import nodemailer from 'nodemailer';
import 'dotenv/config';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const info = await transporter.sendMail({
  from: '"Example Team" <team@example.com>', // sender address
  to: 'tegije7041@bwingmedia.com', // list of recipients
  subject: 'Hello', // subject line
  text: 'Hello world?', // plain text body
  html: '<b>Hello world?</b>', // HTML body
});

// eslint-disable-next-line no-console
console.log('Email sent:', info.messageId);
