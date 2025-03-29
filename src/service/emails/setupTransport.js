import 'dotenv/config';
import nodemailer from 'nodemailer';

const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS } = process.env;

export const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
