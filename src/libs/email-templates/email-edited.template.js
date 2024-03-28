'use strict';

const { EmailSubjects } = require('../enums/enums.js');

const getEmailEditedTemplate = (email, title = EmailSubjects.EMAIL_EDITED) => {
  return `
      <h1>${title}</h1>
      <p>Your account email has been changed to ${email}</p>
    `;
};

module.exports = {
  getEmailEditedTemplate,
};
