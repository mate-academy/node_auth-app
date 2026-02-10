const nodemailer = require('nodemailer');
const { sendActivationEmail, sendPasswordResetEmail, sendEmailChangeNotification } = require('./src/utils/email');

function logPreviewUrl(info) {
  if (info && info.messageId) {
     console.log('Message sent: %s', info.messageId);
  }
  const url = nodemailer.getTestMessageUrl(info);
  if (url) {
    console.log('Preview URL: %s', url);
  }
}

async function testEmail() {
  try {
    console.log('--- Testing Activation Email ---');
    const info1 = await sendActivationEmail('test@example.com', 'test-token-123');
    logPreviewUrl(info1);

    console.log('\n--- Testing Password Reset Email ---');
    const info2 = await sendPasswordResetEmail('test@example.com', 'reset-token-456');
    logPreviewUrl(info2);

    console.log('\n--- Testing Email Change Notification ---');
    const info3 = await sendEmailChangeNotification('old@example.com', 'new@example.com');
    logPreviewUrl(info3);

    console.log('\nAll email tests passed successfully!');
  } catch (error) {
    console.error('Email test failed:', error);
    process.exit(1);
  }
}

testEmail();
