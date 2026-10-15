import { mailer } from './email.service.js';

await mailer.send('any-address@email.com', 'test', 'test123');

// eslint-disable-next-line no-console
console.log('Mail sent');
