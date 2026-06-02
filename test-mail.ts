import { mailer } from "./src/services/email.service";

await mailer.send('any-address@email.com', 'test76w', '<h1>Test email</h1><p>This is a test email sent from the test-mail.ts script.</p>');

console.log('Mail sent');
