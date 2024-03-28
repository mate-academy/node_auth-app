'use strict';

const { EmailService } = require('./email.service.js');

const emailService = new EmailService();

module.exports = {
  emailService,
};
