'use strict';

const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { Store } = require('../src/store');

describe('email store', () => {
  let temporaryDirectory;

  afterEach(async () => {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  });

  test('returns complete development inbox messages', async () => {
    temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'outbox-'));

    const store = new Store(path.join(temporaryDirectory, 'auth.json'));
    const message = {
      from: 'Northstar <test@example.com>',
      to: 'maya@example.com',
      subject: 'Activate your account',
      text: 'Plain text message',
      html: '<p>Email body</p>',
    };

    await store.ready;
    await store.saveEmail(message);

    expect(await store.listEmails()).toEqual([
      expect.objectContaining({
        ...message,
        createdAt: expect.any(String),
      }),
    ]);
  });
});
