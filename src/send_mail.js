'use strict';
require('dotenv').config();

const { send } = require('./services/emailService');

send({
  email: 'vovzin43@gmail.com',
  subject: 'test',
  html: '<h1>Может еще одно задание бахнем?!!</h1>',
});
