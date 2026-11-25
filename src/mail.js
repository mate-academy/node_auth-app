/* eslint-disable no-console */
'use strict';

const nodemailer = require('nodemailer');

const { baseUrl, SMTP_URL, MAIL_FROM } = require('./config');

const { db, addMail, nextMail, removeMail } = require('./db');

const { randomToken, digest, text } = require('./security');

const smtp = SMTP_URL ? nodemailer.createTransport(SMTP_URL) : null;

let sendingMail = false;

async function deliverMail() {
  if (sendingMail) {
    return;
  }

  sendingMail = true;

  try {
    let lastId = 0;

    for (let mail = nextMail.get(lastId); mail; mail = nextMail.get(lastId)) {
      lastId = mail.id;

      if (mail.expires !== null && mail.expires <= Date.now()) {
        removeMail.run(mail.id);
        continue;
      }

      try {
        if (smtp) {
          await smtp.sendMail({
            from: MAIL_FROM || 'Auth App <auth@example.test>',
            to: { address: mail.recipient },
            subject: mail.subject,
            text: mail.message,
          });
        } else {
          console.log(
            '[Local email] To: %s | %s\n%s',
            mail.recipient,
            mail.subject,
            mail.message,
          );
        }

        removeMail.run(mail.id);
      } catch {
        console.error('Email delivery failed. The server will retry.');
      }
    }
  } finally {
    sendingMail = false;
  }
}

function flushMail() {
  deliverMail().catch(console.error);
}

function issueToken(
  userId,
  { purpose, route, recipient, subject, minutes, email = null },
) {
  const token = randomToken();
  const expires = Date.now() + minutes * 60_000;

  db.prepare(
    `
    INSERT INTO tokens
      (digest, user_id, purpose, email, expires)
    VALUES (?, ?, ?, ?, ?)

    ON CONFLICT (user_id, purpose)
    DO UPDATE SET
      digest = excluded.digest,
      email = excluded.email,
      expires = excluded.expires
  `,
  ).run(digest(token), userId, purpose, email, expires);

  const link = new URL(route, baseUrl);

  link.searchParams.set('token', token);

  addMail.run(recipient, subject, subject + ':\n' + link.href, expires);
}

function findToken(value, purpose) {
  const token = text(value);

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return undefined;
  }

  return db
    .prepare(
      `
    SELECT * FROM tokens
    WHERE digest = ?
      AND purpose = ?
      AND expires > ?
  `,
    )
    .get(digest(token), purpose, Date.now());
}

function queueActivation(id, email) {
  issueToken(id, {
    purpose: 'activation',
    route: '/activate',
    recipient: email,
    subject: 'Activate your account',
    minutes: 1440,
  });
}

module.exports = {
  flushMail,
  issueToken,
  findToken,
  queueActivation,
};
