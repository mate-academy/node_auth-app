'use strict';

const assert = require('node:assert');
const http = require('node:http');
const { createServer } = require('./index');

function startServer() {
  const server = createServer();

  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();

      resolve({
        server,
        port: address.port,
      });
    });
  });
}

function makeRequest(server, method, path, options = {}) {
  const { body = '', headers = {} } = options;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: server.address().port,
        path,
        method,
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          ...headers,
        },
      },
      (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      },
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getCookie(headers) {
  const setCookie = headers['set-cookie'];

  return Array.isArray(setCookie) ? setCookie[0] : setCookie;
}

describe('auth application', () => {
  let server;

  beforeEach(async () => {
    ({ server } = await startServer());
  });

  afterEach((done) => {
    server.close(done);
  });

  it('registers a user and activates the account via email token', async () => {
    const registerResponse = await makeRequest(server, 'POST', '/register', {
      body: 'name=Test+User&email=test@example.com&password=Abc123!@',
    });

    assert.strictEqual(registerResponse.statusCode, 200);

    const tokenMatch = registerResponse.body.match(/activate\?token=([^"']+)/);

    assert.ok(tokenMatch, 'activation link should be present');

    const activationResponse = await makeRequest(
      server,
      'GET',
      `/activate?token=${tokenMatch[1]}`,
    );

    assert.strictEqual(activationResponse.statusCode, 302);
    assert.strictEqual(activationResponse.headers.location, '/profile');

    const profileResponse = await makeRequest(server, 'GET', '/profile', {
      headers: {
        cookie: getCookie(activationResponse.headers),
      },
    });

    assert.strictEqual(profileResponse.statusCode, 200);
    assert.match(profileResponse.body, /Welcome, Test User/i);
  });

  // eslint-disable-next-line max-len
  it('allows a user to reset the password and sign in with the new password', async () => {
    const registerResponse = await makeRequest(server, 'POST', '/register', {
      body: 'name=Reset+User&email=reset@example.com&password=Abc123!@',
    });

    const activationTokenMatch = registerResponse.body.match(
      /activate\?token=([^"']+)/,
    );

    await makeRequest(
      server,
      'GET',
      `/activate?token=${activationTokenMatch[1]}`,
    );

    const forgotResponse = await makeRequest(
      server,
      'POST',
      '/forgot-password',
      {
        body: 'email=reset@example.com',
      },
    );

    const resetTokenMatch = forgotResponse.body.match(
      /reset-password\?token=([^"']+)/,
    );

    assert.ok(resetTokenMatch, 'reset link should be present');

    const resetResponse = await makeRequest(
      server,
      'POST',
      `/reset-password?token=${resetTokenMatch[1]}`,
      {
        body: 'password=NewPass123!&confirmation=NewPass123!',
      },
    );

    assert.strictEqual(resetResponse.statusCode, 200);
    assert.match(resetResponse.body, /Password updated/i);

    const loginResponse = await makeRequest(server, 'POST', '/login', {
      body: 'email=reset@example.com&password=NewPass123!',
    });

    assert.strictEqual(loginResponse.statusCode, 302);
    assert.strictEqual(loginResponse.headers.location, '/profile');
  });

  // eslint-disable-next-line max-len
  it('allows a signed in user to change their password from the profile page', async () => {
    const registerResponse = await makeRequest(server, 'POST', '/register', {
      body: 'name=Profile+User&email=profile@example.com&password=Abc123!@',
    });

    const activationTokenMatch = registerResponse.body.match(
      /activate\?token=([^"']+)/,
    );

    await makeRequest(
      server,
      'GET',
      `/activate?token=${activationTokenMatch[1]}`,
    );

    const loginResponse = await makeRequest(server, 'POST', '/login', {
      body: 'email=profile@example.com&password=Abc123!@',
    });

    const profileResponse = await makeRequest(server, 'POST', '/profile', {
      body:
        'oldPassword=Abc123!@&newPassword=NewPass456!&confirmation=' +
        'NewPass456!',
      headers: {
        cookie: getCookie(loginResponse.headers),
      },
    });

    assert.strictEqual(profileResponse.statusCode, 200);
    assert.match(profileResponse.body, /Password updated/i);

    const loginWithNewPasswordResponse = await makeRequest(
      server,
      'POST',
      '/login',
      {
        body: 'email=profile@example.com&password=NewPass456!',
      },
    );

    assert.strictEqual(loginWithNewPasswordResponse.statusCode, 302);

    assert.strictEqual(
      loginWithNewPasswordResponse.headers.location,
      '/profile',
    );
  });

  it('redirects authenticated users away from the login page', async () => {
    const registerResponse = await makeRequest(server, 'POST', '/register', {
      body: 'name=Guard+User&email=guard@example.com&password=Abc123!@',
    });

    const activationTokenMatch = registerResponse.body.match(
      /activate\?token=([^"']+)/,
    );

    const activationResponse = await makeRequest(
      server,
      'GET',
      `/activate?token=${activationTokenMatch[1]}`,
    );

    const loginResponse = await makeRequest(server, 'GET', '/login', {
      headers: {
        cookie: getCookie(activationResponse.headers),
      },
    });

    assert.strictEqual(loginResponse.statusCode, 302);
    assert.strictEqual(loginResponse.headers.location, '/profile');
  });

  // eslint-disable-next-line max-len
  it('allows a signed in user to change their email from the profile page', async () => {
    const registerResponse = await makeRequest(server, 'POST', '/register', {
      body: 'name=Email+User&email=old@example.com&password=Abc123!@',
    });

    const activationTokenMatch = registerResponse.body.match(
      /activate\?token=([^"']+)/,
    );

    await makeRequest(
      server,
      'GET',
      `/activate?token=${activationTokenMatch[1]}`,
    );

    const loginResponse = await makeRequest(server, 'POST', '/login', {
      body: 'email=old@example.com&password=Abc123!@',
    });

    const profileResponse = await makeRequest(server, 'POST', '/profile', {
      body:
        'password=Abc123!@&newEmail=new@example.com&confirmationEmail=' +
        'new@example.com',
      headers: {
        cookie: getCookie(loginResponse.headers),
      },
    });

    assert.strictEqual(profileResponse.statusCode, 200);
    assert.match(profileResponse.body, /Email updated/i);
    assert.match(profileResponse.body, /old@example.com/i);

    const loginWithNewEmailResponse = await makeRequest(
      server,
      'POST',
      '/login',
      {
        body: 'email=new@example.com&password=Abc123!@',
      },
    );

    assert.strictEqual(loginWithNewEmailResponse.statusCode, 302);
    assert.strictEqual(loginWithNewEmailResponse.headers.location, '/profile');
  });
});
