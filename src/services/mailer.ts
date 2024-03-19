import 'dotenv/config';
import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST ?? 'smtp.gmail.com',
  port: +(SMTP_PORT ?? '587'),
  auth: {
    user: SMTP_USER ?? 'misivsvatoslav@gmail.com',
    pass: SMTP_PASSWORD ?? 'bdfnotawmrlmvnev',
  },
});

export type TransporterType = typeof transporter;
export default transporter;
