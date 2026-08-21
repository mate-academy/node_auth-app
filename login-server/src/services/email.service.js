import 'dotenv/config';
import nodemailer from 'nodemailer';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

try {
  const info = await transporter.sendMail({
    to: 'zqzam3pdtk@lnovic.com', // list of recipients
    subject: 'Hello', // subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>', // HTML body
  });

  console.log('Message sent: %s', info.messageId);
  // Preview URL is only available when using an Ethereal test account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
} catch (err) {
  console.error('Error while sending mail:', err);
}

console.log('Email is sent');
