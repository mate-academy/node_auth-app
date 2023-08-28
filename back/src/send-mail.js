import 'dotenv/config';
import { send } from './services/emailService.js';

send({
  email: 'sewihi7454@nifect.com',
  subject: 'Test',
  html: '123',
})