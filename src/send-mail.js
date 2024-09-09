import { sendMail } from './services/service-mail.js';

export const info = sendMail({
  to: 'xemifo1015@obisims.com',
  subject: '<b>niby gmail a jednak nie</b>',
  html: 'siemka',
});
