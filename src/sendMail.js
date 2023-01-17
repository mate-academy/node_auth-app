'use strict';

require('dotenv/config');

const { send } = require('./services/emailService');

send({
  email: 'revof43862@dentaltz.com',
  subject: 'Test',
  html: '123',
});
