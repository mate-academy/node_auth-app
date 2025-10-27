'use strict';

const { db } = require('../models/db');

function sendMail({ to, subject, html }) {
  const createdAt = new Date().toISOString();

  db.outbox.push({
    to,
    subject,
    html,
    createdAt,
  });

  // eslint-disable-next-line no-console
  console.log(`[MAIL] to=${to} subject="${subject}"\n${html}\n`);
}

module.exports = { sendMail };
