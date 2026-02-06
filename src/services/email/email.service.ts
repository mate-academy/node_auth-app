import { getTemplate, mailTemplate } from './email.const.ts';
import transporter from './transporter.ts';

async function sendMail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@example.com',
    to: to,
    subject: subject,
    html: html,
  });
}

async function sendTemplateMail(
  email: string,
  token: string,
  type: (typeof mailTemplate)[keyof typeof mailTemplate],
): Promise<boolean> {
  const data = getTemplate[type](token);

  try {
    await sendMail(email, data.subject, data.html);

    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    return false;
  }
}

const eml = {
  sdM: sendMail,
  sdTM: sendTemplateMail,
};

export default eml;
