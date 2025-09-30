import { sendEmail } from './email.js';

await sendEmail({
  email: 'user@example.com',
  subject: 'Welcome!',
  message: 'Thank you for joining our service',
});

// HTML email with reply-to
await sendEmail({
  email: 'user@example.com',
  subject: 'Your Order',
  html: '<h1>Order Confirmation</h1><p>Thank you for your purchase!</p>',
  replyTo: 'support@ecocosmetics.com',
});
