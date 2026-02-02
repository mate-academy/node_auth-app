import nodemailer from "nodemailer";

/*ENV GUARDS*/
const {
  SMTP_USER,
  SMTP_PASS,
  CLIENT_HOST,
  SERVER_HOST,
} = process.env;

/*TRANSPORTER (SAFE)*/
let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  console.warn("⚠️ SMTP is not configured. Emails will not be sent.");
}

/*BASE SEND FUNCTION*/
export function send({ to, subject, html }) {
  if (!transporter) {
    console.warn(`📭 Email skipped → ${subject} → ${to}`);
    return Promise.resolve();
  }

  return transporter.sendMail({
    from: SMTP_USER,
    to,
    subject,
    html,
  });
}

/*HELPERS*/
const getClientHost = () => CLIENT_HOST || "http://localhost:3000";
const getServerHost = () => SERVER_HOST || "http://localhost:5000";

/*АКТИВАЦІЯ АКАУНТУ*/
export function sendActivationEmail(email, token) {
  const link = `${getClientHost()}/activate/${token}`;

  return send({
    to: email,
    subject: "🔐 Активація акаунту",
    html: `
      <div style="background:#f9fafb;padding:40px 0;font-family:Arial,sans-serif">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:32px;text-align:center">
          <h2>Активація акаунту 🔓</h2>
          <p>Щоб активувати акаунт, натисніть кнопку нижче:</p>
          <a href="${link}" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none">
            АКТИВУВАТИ АКАУНТ
          </a>
          <p style="font-size:11px;margin-top:24px">⌛ Посилання дійсне 15 хвилин</p>
        </div>
      </div>
    `,
  });
}

/*ВІДНОВЛЕННЯ ПАРОЛЯ*/
export function sendResetPasswordEmail(email, token) {
  const link = `${getClientHost()}/reset-password/${token}`;

  return send({
    to: email,
    subject: "🔑 Відновлення пароля",
    html: `
      <div style="background:#f9fafb;padding:40px 0;font-family:Arial,sans-serif">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:32px;text-align:center">
          <h2>Відновлення пароля 🔑</h2>
          <p>Щоб встановити новий пароль, натисніть кнопку:</p>
          <a href="${link}" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none">
            СКИНУТИ ПАРОЛЬ
          </a>
          <p style="font-size:11px;margin-top:24px">⌛ Посилання дійсне 15 хвилин</p>
        </div>
      </div>
    `,
  });
}

/*CONFIRM CHANGE PASSWORD*/
export function sendChangePasswordEmail(email, token) {
  const link = `${getServerHost()}/api/auth/confirm-change-password/${token}`;

  return send({
    to: email,
    subject: "🔐 Підтвердження зміни пароля",
    html: `
      <div style="background:#f9fafb;padding:40px 0;font-family:Arial,sans-serif">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:32px;text-align:center">
          <h2>Підтвердження зміни пароля 🔐</h2>
          <p>Щоб підтвердити зміну пароля, натисніть кнопку:</p>
          <a href="${link}" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none">
            ЗМІНИТИ ПАРОЛЬ
          </a>
          <p style="font-size:11px;margin-top:24px">⌛ Посилання дійсне 15 хвилин</p>
        </div>
      </div>
    `,
  });
}

/*CONFIRM CHANGE EMAIL*/
export function sendChangeEmailEmail(email, token) {
  const link = `${getServerHost()}/api/auth/confirm-change-email/${token}`;

  return send({
    to: email,
    subject: "📨 Підтвердження зміни електронної пошти",
    html: `
      <div style="background:#f9fafb;padding:40px 0;font-family:Arial,sans-serif">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:32px;text-align:center">
          <h2>Підтвердження нової пошти ✉️</h2>
          <p>Щоб підтвердити нову адресу, натисніть кнопку:</p>
          <a href="${link}" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none">
            ПІДТВЕРДИТИ ПОШТУ
          </a>
          <p style="font-size:11px;margin-top:24px">⌛ Посилання дійсне 15 хвилин</p>
        </div>
      </div>
    `,
  });
}
