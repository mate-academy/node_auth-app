import { sendMail } from './services/mail-service.js';

const info = await sendMail({
  to: 'vakewo2017@tiervio.com',
  subject: 'Just testing',
  html: '<h1>Test mail</h1>',
});
