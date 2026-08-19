'use strict';

const env = require('../config/env');

function createEmailService() {
  const outbox = [];

  async function deliver(message) {
    const payload = {
      from: env.mail.from,
      ...message,
    };

    if (!env.mail.webhookUrl && env.nodeEnv === 'production') {
      throw new Error('Email delivery is not configured');
    }

    if (env.mail.webhookUrl) {
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
      };

      if (env.mail.webhookToken) {
        headers.Authorization = `Bearer ${env.mail.webhookToken}`;
      }

      const response = await global.fetch(env.mail.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Email delivery failed');
      }
    }

    if (env.nodeEnv !== 'production') {
      outbox.push(payload);
    }
  }

  return {
    async sendActivationEmail(email, token) {
      const url = `${env.appUrl}/activate/${token}`;

      await deliver({
        to: email,
        subject: 'Activate your account',
        text: `Activate your account: ${url}`,
      });
    },

    async sendResetEmail(email, token) {
      const url = `${env.appUrl}/reset-password/${token}`;

      await deliver({
        to: email,
        subject: 'Reset your password',
        text: `Reset your password: ${url}`,
      });
    },

    async sendEmailChangeNotification(oldEmail, newEmail) {
      await deliver({
        to: oldEmail,
        subject: 'Your account email was changed',
        text: `Your account email was changed to ${newEmail}.`,
      });
    },

    getOutbox() {
      return outbox.map((message) => ({ ...message }));
    },

    clearOutbox() {
      outbox.length = 0;
    },
  };
}

module.exports = createEmailService;
