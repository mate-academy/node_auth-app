'use strict';

const { EmailSubjects } = require('../enums/enums.js');

const getPasswordResetTemplate = (
  token,
  title = EmailSubjects.PASSWORD_RESET
) => {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  return `
      <h1>${title}</h1>
      <a href="${link}">${link}</a>
    `;
};

module.exports = {
  getPasswordResetTemplate,
};
