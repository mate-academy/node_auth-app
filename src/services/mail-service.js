import nodeMailer from 'nodemailer';

export async function sendMail({ to, subject, text, html }) {

    const transporter = nodeMailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});


    const info = await transporter.sendMail({
      from: `AUTH APP, <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text: text ?? "",
      html,
    });

    console.log(`Message sent: ${info.messageId}`)
  }

  export async function sendActivationMail(email, activationToken) {
    const link = `${process.env.CLIENT_URL}/activate/${activationToken}`;

    await sendMail({
        to: email,
        subject: 'Account activated',
        html: `
        <p> Follow the link below to activate your account</p>
        <a href="${link}">${link}</a>`
    })
  }

  export async function sendPasswordResetEmail(email, activationToken)  {
    const link = `${process.env.CLIENT_URL}/reset/${activationToken}`;
    await sendMail({
      to: email,
      subject: 'Reset your password',
      html: `
      <p> Click this link below to reset your password.</p>
        <a href="${link}">${link}</a>`
    })
  }
