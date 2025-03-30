import 'dotenv/config';
import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});

export default transporter;
