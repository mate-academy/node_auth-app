import { Transporter } from 'nodemailer';

export const sendEmail = async (
  transporter: Transporter,
  to: string,
  subject: string,
  link: string,
  actionText: string
): Promise<void> => {
  await transporter.sendMail({
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: `${actionText}: ${link}`,
    html: `
      <h1>${actionText}</h1>
      <p>Click the link below to ${actionText.toLowerCase()}:</p>
      <a href="${link}">${link}</a>
    `,
  });
};
