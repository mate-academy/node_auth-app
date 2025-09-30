import Email from './email.js';

const user = {
  email: 'user@example.com',
  name: 'John Doe',
};
const activationUrl = 'https://example.com/activate?token=abc123';

const email = new Email(user, activationUrl);

// Send welcome email
await email.sendWelcome();

// Send password reset
await email.sendPasswordReset();
