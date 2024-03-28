'use strict';

const { EmailSubjects } = require('../enums/enums.js');

const getActivationTemplate = (token, title = EmailSubjects.ACTIVATION) => {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return `
      <h1>${title}</h1>
      <a href="${link}">${link}</a>
    `;
};

module.exports = {
  getActivationTemplate,
};
