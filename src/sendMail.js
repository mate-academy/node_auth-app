'use strict';

import 'dotenv/config';
import { send } from './services/emailService.js';

send({
  email: 'revof43862@dentaltz.com',
  subject: 'Test',
  html: '123',
});
