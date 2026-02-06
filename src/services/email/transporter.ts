import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'palma.spencer@ethereal.email',
    pass: 'YhYHdzdxqn1Vcs98GW',
  },
});

export default transporter;
