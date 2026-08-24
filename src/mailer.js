'use strict';

const { logger } = require('./logger');

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
      logger.info(`[email preview] ${subject} → ${to}`);

      return;
    }

    if (typeof global.fetch !== 'function') {
      throw new Error('Email delivery requires Node.js 20 or newer');
    }

    const response = await global.fetch('https://api.resend.com/emails', {
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
      const responseBody = (await response.text()).slice(0, 500);
      const detail = responseBody || 'No response body';

      throw new Error(`Email provider returned ${response.status}: ${detail}`);
    }
  };

  return { send };
};

module.exports = { createMailer };
