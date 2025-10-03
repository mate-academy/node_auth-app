/* eslint-disable no-console */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function main() {
  try {
    await transporter.sendMail({
      from: '"Auth App 👻" <no-reply@example.com>',
      to: 'test@example.com',
      subject: 'Hello from Node.js ✔',
      text: 'This is a test email sent via Mailtrap',
      html: '<b>This is a test email sent via Mailtrap</b>',
    });
    console.log('✅ Test email sent!');
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

main();
