import 'dotenv/config';
import { send } from './services/emailService.js';

send({
  email: 'oselskyi3@gmail.com',
  subject: 'TESt',
  html: '123',
});
