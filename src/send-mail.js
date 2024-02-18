import 'dotenv/config';
import { send } from './services/emailService.js';

send({
  email: 'no4kar@gmail.com',
  subject: 'Test',
  html: '123',
})