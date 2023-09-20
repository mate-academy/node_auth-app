
import 'dotenv/config';

import { send } from './services/emailService';

send({
  email: 'lojexad635@recutv.com',
  subject: 'test',
  html: '<h1>Check for mail sending</h1>',
});
