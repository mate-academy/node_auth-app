import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'loma98@ethereal.email',
      pass: 'ctAJeeAv1aR6wCtz6G'
  }
});

const info = await transporter.sendMail({
  from: 'loma98@ethereal.email',
  to: "spamer@helloWorld.net", // list of receivers
  subject: "Hello ✔", // Subject line
  text: "Hello world? world?dlfjldfjldfj", // plain text body
  html: "<b>Hello world?</b>", // html body
});

console.log("Email is send", info);

