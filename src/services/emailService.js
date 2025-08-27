'use strict';

// Тестовий транспорт для демонстрації (виводить в консоль замість відправки)
const testTransporter = {
  sendMail: async (mailOptions) => {
    // eslint-disable-next-line no-console
    console.log('\n📧 === EMAIL НАДІСЛАНО ===');
    // eslint-disable-next-line no-console
    console.log('📤 Від:', mailOptions.from);
    // eslint-disable-next-line no-console
    console.log('📥 До:', mailOptions.to);
    // eslint-disable-next-line no-console
    console.log('📋 Тема:', mailOptions.subject);
    // eslint-disable-next-line no-console
    console.log('📄 Текст:', mailOptions.html);
    // eslint-disable-next-line no-console
    console.log('===========================\n');

    return { messageId: 'test-' + Date.now() };
  },
};

// Використовуємо тестовий транспорт
const emailTransporter = testTransporter;

class EmailService {
  // Відправка листа активації
  static async sendActivationEmail(email, name, activationToken) {
    const activationUrl = `http://localhost:3000/auth/activate/${activationToken}`;

    const mailOptions = {
      from: '"Система авторизації" <noreply@example.com>',
      to: email,
      subject: 'Активація вашого облікового запису',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Вітаємо, ${name}!</h2>
          <p>Дякуємо за реєстрацію в нашій системі.</p>
          <p>Для активації вашого облікового запису, будь ласка, натисніть на посилання нижче:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${activationUrl}"
               style="background-color: #007bff; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Активувати обліковий запис
            </a>
          </div>
          <p>Якщо посилання не працює, скопіюйте та вставте це URL у ваш браузер:</p>
          <p style="word-break: break-all; color: #666;">${activationUrl}</p>
          <p>Це посилання дійсне протягом 24 годин.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Якщо ви не реєструвалися в нашій системі, проігноруйте цей лист.
          </p>
        </div>
      `,
    };

    try {
      await emailTransporter.sendMail(mailOptions);

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Помилка відправки листа активації:', error);

      return false;
    }
  }

  // Відправка листа для скидання пароля
  static async sendPasswordResetEmail(email, name, resetToken) {
    const resetUrl = `http://localhost:3000/auth/reset-password/${resetToken}`;

    const mailOptions = {
      from: '"Система авторизації" <noreply@example.com>',
      to: email,
      subject: 'Скидання пароля',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Вітаємо, ${name}!</h2>
          <p>Ви отримали запит на скидання пароля для вашого облікового запису.</p>
          <p>Для створення нового пароля, будь ласка, натисніть на посилання нижче:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #dc3545; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Скинути пароль
            </a>
          </div>
          <p>Якщо посилання не працює, скопіюйте та вставте це URL у ваш браузер:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>Це посилання дійсне протягом 1 години.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Якщо ви не запитували скидання пароля, проігноруйте цей лист.
          </p>
        </div>
      `,
    };

    try {
      await emailTransporter.sendMail(mailOptions);

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Помилка відправки листа для скидання пароля:', error);

      return false;
    }
  }

  // Відправка листа про зміну email
  static async sendEmailChangeNotification(oldEmail, name) {
    const mailOptions = {
      from: '"Система авторизації" <noreply@example.com>',
      to: oldEmail,
      subject: 'Зміна електронної адреси',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Вітаємо, ${name}!</h2>
          <p>Це повідомлення про те, що електронна адреса для вашого облікового запису була змінена.</p>
          <p>Якщо ви не робили цю зміну, будь ласка, зв'яжіться з нами негайно.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Це автоматичне повідомлення, не відповідайте на нього.
          </p>
        </div>
      `,
    };

    try {
      await emailTransporter.sendMail(mailOptions);

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Помилка відправки листа про зміну email:', error);

      return false;
    }
  }
}

module.exports = EmailService;
