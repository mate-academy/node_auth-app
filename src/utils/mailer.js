import nodemailer from 'nodemailer';
import 'dotenv/config';

// eslint-disable-next-line no-console
console.log(process.env.SMTP_USER, process.env.SMTP_PASSWORD);

export async function transporter() {
  const testAccount = await nodemailer.createTestAccount();

  const create = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return create;
}
