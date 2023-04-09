'use strict';
require('dotenv').config();

const { send } = require('./services/emailService');

send({
  email: 'memig58540@dogemn.com',
  subject: 'test',
  html: '<h1>Its working!!!</h1>',
});
