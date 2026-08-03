'use strict';

const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true для 465 порту, false для інших
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Активація акаунта на ${process.env.API_URL}`,
      text: '',
      html: `
        <div>
          <h1>Для активації перейдіть за посиланням</h1>
          <a href="${link}">${link}</a>
        </div>
      `,
    });
  }

  async sendPasswordResetMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Скидання пароля на ${process.env.API_URL}`,
      text: '',
      html: `
        <div>
          <h1>Для скидання пароля перейдіть за посиланням</h1>
          <a href="${link}">${link}</a>
        </div>
      `,
    });
  }

  // ДОДАЄМО МЕТОД ДЛЯ ПОВІДОМЛЕННЯ ПРО ЗМІНУ ПОШТИ (вимога ментора)
  async sendEmailChangeNotification(to, message) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Запит на зміну електронної пошти',
      text: message,
      html: `
        <div>
          <h1>Сповіщення безпеки</h1>
          <p>${message}</p>
        </div>
      `,
    });
  }
}

module.exports = {
  mailService: new MailService(),
};
