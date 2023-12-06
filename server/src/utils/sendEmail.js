'use strict'

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  service: process.env.SERVICE,
  port: Number(process.env.EMAIL_PORT),
  secure: Boolean(process.env.SECURE),
  auth: {
    user: process.env.USER,
    pass: process.env.APP_EMAIL_PASS,
  },
});

export const sendEmail = async ({email, type, title, token}) => {
  const href = `
  ${process.env.CLIENT_HOST}/${type}?token=${token}
  `;

  const html = `
  <h1>${title}</h1>
  <a href="${href}">${href}</a>
  `;
		return transporter.sendMail({
			to: email,
			subject: title,
			html: html,
		});
};

export const sendNotificationOfEmailChange = async ({currentEmail,title, text}) => {
		return transporter.sendMail({
			to: currentEmail,
			subject: title,
			text,
		});
};
