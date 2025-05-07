import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'marusia199510@gmail.com',
    pass: 'brqm xdhg cvxk nbsn',
  },
});

async function send(email, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: 'marusia199510@gmail.com',
      to: email,
      subject,
      html,
    });

    // eslint-disable-next-line no-console
    console.log('Лист відправлено:', info.response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Помилка при відправці:', error);
  }
}

function sendActivationLink(email, activationToken) {
  const link = `${process.env.CLIENT_URL}/activate/${email}/${encodeURIComponent(activationToken)}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

export const mailer = {
  send,
  sendActivationLink,
};
