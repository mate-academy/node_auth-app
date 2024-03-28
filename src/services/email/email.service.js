'use strict';

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async send({ email, subject, html }) {
    return this.transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject,
      html,
    });
  }
}

module.exports = {
  EmailService,
};
