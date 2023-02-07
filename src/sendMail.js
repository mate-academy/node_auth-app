'use strict';

import 'dotenv/config';

import emailService from './services/emailService.js';

emailService.send({
  email: 'test@gmail.com',
  subject: 'Test',
  html: '123',
});
