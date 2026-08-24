'use strict';

const createMailer = (config, store) => {
  const send = async ({ to, subject, text, html }) => {
    if (!config.isProduction) {
      await store.saveEmail({
        from: config.mailFrom,
        to,
        subject,
        text,
        html,
      });
    }

    if (!config.resendApiKey) {
      console.log(`[email preview] ${subject} → ${to}`);

      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.mailFrom,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email provider returned ${response.status}`);
    }
  };

  return { send };
};

module.exports = { createMailer };
