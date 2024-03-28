'use strict';

const { EmailSubjects } = require('../enums/enums.js');

const getEditEmailRequestTemplate = (
  token,
  title = EmailSubjects.EDIT_EMAIL_REQUEST
) => {
  const link = `${process.env.CLIENT_URL}/confirm-edit-email/${token}`;

  return `
      <h1>${title}</h1>
      <a href="${link}">${link}</a>
    `;
};

module.exports = {
  getEditEmailRequestTemplate,
};
