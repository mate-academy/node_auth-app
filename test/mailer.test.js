'use strict';

const { createMailer } = require('../src/mailer');

describe('mailer', () => {
  const message = {
    to: 'maya@example.com',
    subject: 'Account email',
    text: 'Plain text',
    html: '<p>Email body</p>',
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('stores the complete message in the development inbox', async () => {
    const store = { saveEmail: jest.fn() };
    const mailer = createMailer(
      {
        isProduction: false,
        mailFrom: 'Northstar <test@example.com>',
        resendApiKey: '',
      },
      store,
    );

    await mailer.send(message);

    expect(store.saveEmail).toHaveBeenCalledWith({
      from: 'Northstar <test@example.com>',
      ...message,
    });
  });

  test('reports the provider response when delivery fails', async () => {
    const store = { saveEmail: jest.fn() };
    const response = {
      ok: false,
      status: 422,
      text: jest.fn().mockResolvedValue('Invalid sender'),
    };

    jest.spyOn(global, 'fetch').mockResolvedValue(response);

    const mailer = createMailer(
      {
        isProduction: true,
        mailFrom: 'Northstar <test@example.com>',
        resendApiKey: 'test-api-key',
      },
      store,
    );

    await expect(mailer.send(message)).rejects.toThrow(
      'Email provider returned 422: Invalid sender',
    );
    expect(store.saveEmail).not.toHaveBeenCalled();
    expect(response.text).toHaveBeenCalled();
  });
});
