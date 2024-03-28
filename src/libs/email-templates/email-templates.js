'use strict';

const { getActivationTemplate } = require('./activation.template.js');
const { getPasswordResetTemplate } = require('./password-reset.template.js');
const { getEmailEditedTemplate } = require('./email-edited.template.js');
const {
  getEditEmailRequestTemplate,
} = require('./edit-email-request.template.js');

module.exports = {
  getActivationTemplate,
  getPasswordResetTemplate,
  getEmailEditedTemplate,
  getEditEmailRequestTemplate,
};
