import { createTransport } from "nodemailer";
const transporter = createTransport({
  host: "test.smtp.mailtrap.io",
  port: 2525,
  secure: false,
  auth: {
    user: process.env.SMTP_USERID,
    pass: process.env.SMTP_PASSWORD
  }
});


export const sendActivationMail = async (to, token) => {
  try {
    const url = `http://localhost:5000/auth/activate/${token}`;

    await transporter.sendMail({
      from: '"My Cool App" <test.smtp.mailtrap.io>',
      to,
      subject: 'Активація акаунта',
      text: `Для активації перейдіть за посиланням: ${url}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Вітаємо у нашому сервісі!</h2>
          <p style="font-size: 16px; color: #555;">
            Ви успішно зареєструвалися. Щоб почати користуватися акаунтом, підтвердіть свою пошту, натиснувши на кнопку нижче:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}"
               style="background-color: #4CAF50; color: white; padding: 14px 25px; text-decoration: none; font-size: 18px; border-radius: 5px; display: inline-block;">
               Активувати акаунт
            </a>
          </div>
          <p style="font-size: 12px; color: #999; text-align: center;">
            Якщо кнопка не працює, скопіюйте це посилання в браузер:<br>
            <a href="${url}">${url}</a>
          </p>
        </div>
      `,
    });
  } catch {
  }
}

export const sendPasswordResetMail = async(to, token) => {
  try {
    const url = `http://localhost:5000/auth/reset-password/${token}`;

    await transporter.sendMail({
      from: '"My Cool App" <test.smtp.mailtrap.io>',
      to,
      subject: 'Скидання пароля',
      text: `Для скидання пароля перейдіть за посиланням:`,
      html: `<p>Для скидання пароля перейдіть за посиланням: <a href="${url}">${url}</a></p>`,
    });
  } catch {
  }
}

export const sendEmailChangeNotification = async (oldEmail, newEmail) => {
  try {
    await transporter.sendMail({
      from: '"My Cool App" <test.smtp.mailtrap.io>',
      to: oldEmail,
      subject: 'Ваш email було змінено',
      text: `Ваш email змінено з ${oldEmail} на ${newEmail}. Якщо це зробили не ви, зверніться в підтримку.`,
    });
  } catch {
  }
}
