'use strict';

const express = require('express');
const myCrypto = require('crypto');

const app = express();

app.use(express.urlencoded({ extended: true }));

const users = [];
const sessions = {};
const tokens = {};

const parseCookies = (cookieHeader) => {
  const list = {};

  if (!cookieHeader) {
    return list;
  }

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0]?.trim();

    if (!name) {
      return;
    }

    const value = parts.slice(1).join('=').trim();

    if (!value) {
      return;
    }

    list[name] = decodeURIComponent(value);
  });

  return list;
};

const generateToken = () => myCrypto.randomBytes(32).toString('hex');

const renderPage = (title, body) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
      <style>body{font-family:sans-serif; padding: 20px;}</style>
    </head>
    <body>
      <h2>${title}</h2>
      ${body}
    </body>
  </html>
`;

const guestOnly = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);

  if (cookies.sessionId && sessions[cookies.sessionId]) {
    return res.redirect('/profile');
  }
  next();
};

const authOnly = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  if (sessionId && sessions[sessionId]) {
    req.userId = sessions[sessionId];
    req.user = users.find((u) => u.id === req.userId);

    if (req.user) {
      return next();
    }
  }
  res.redirect('/login');
};

app.get('/', guestOnly, (req, res) => res.redirect('/login'));

app.get('/register', guestOnly, (req, res) => {
  res.send(
    renderPage(
      'Register',
      '<p>Password rules: minimum 6 characters.</p>' +
        '<form method="POST" action="/register">' +
        // eslint-disable-next-line max-len
        '<label>Name: <input type="text" name="name" required></label><br><br>' +
        '<label>Email: <input type="email" name="email" required></label>' +
        '<br><br>' +
        '<label>Password: <input type="password" name="password" required>' +
        '</label><br><br>' +
        '<button type="submit">Register</button>' +
        '</form>' +
        '<p><a href="/login">Already have an account? Login</a></p>',
    ),
  );
});

app.post('/register', guestOnly, (req, res) => {
  const { name, email, password } = req.body;

  if (password.length < 6) {
    return res.send(
      renderPage(
        'Error',
        '<p>Password must be at least 6 characters.</p>' +
          '<a href="/register">Back</a>',
      ),
    );
  }

  if (users.find((u) => u.email === email)) {
    return res.send(
      renderPage(
        'Error',
        '<p>Email already registered.</p><a href="/register">Back</a>',
      ),
    );
  }

  const userId = generateToken();

  users.push({
    id: userId,
    name,
    email,
    password,
    active: false,
  });

  const activationToken = generateToken();

  tokens[activationToken] = { type: 'activation', userId };

  // eslint-disable-next-line no-console
  console.log(
    `\n[EMAIL] To: ${email}\n` +
      `Link: http://localhost:3000/activate?token=${activationToken}\n`,
  );

  res.send(
    renderPage(
      'Success',
      '<p>Registration successful! Please check your email.</p>' +
        '<a href="/login">Go to Login</a>',
    ),
  );
});

app.get('/activate', guestOnly, (req, res) => {
  const { token } = req.query;
  const tokenData = tokens[token];

  if (!tokenData || tokenData.type !== 'activation') {
    return res.send(
      renderPage('Error', '<p>Invalid or expired activation link.</p>'),
    );
  }

  const user = users.find((u) => u.id === tokenData.userId);

  if (user) {
    user.active = true;

    // Автоматически логиним пользователя
    const sessionId = generateToken();

    sessions[sessionId] = user.id;
    res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/`);
  }
  delete tokens[token];

  // Редирект в профиль после успешной активации
  res.redirect('/profile');
});

app.get('/login', guestOnly, (req, res) => {
  res.send(
    renderPage(
      'Login',
      '<form method="POST" action="/login">' +
        '<label>Email: <input type="email" name="email" required></label>' +
        '<br><br>' +
        '<label>Password: <input type="password" name="password" required>' +
        '</label><br><br>' +
        '<button type="submit">Login</button>' +
        '</form>' +
        '<p><a href="/register">Register</a> | ' +
        '<a href="/reset-password">Forgot Password?</a></p>',
    ),
  );
});

app.post('/login', guestOnly, (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.send(
      renderPage(
        'Error',
        '<p>Invalid credentials.</p><a href="/login">Back</a>',
      ),
    );
  }

  if (!user.active) {
    return res.send(
      renderPage(
        'Activation Required',
        '<p>Your account is not active. Check your email to activate it.</p>' +
          '<a href="/login">Back</a>',
      ),
    );
  }

  const sessionId = generateToken();

  sessions[sessionId] = user.id;
  res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/`);
  res.redirect('/profile');
});

app.get('/reset-password', guestOnly, (req, res) => {
  res.send(
    renderPage(
      'Reset Password',
      '<form method="POST" action="/reset-password">' +
        '<label>Email: <input type="email" name="email" required></label>' +
        '<br><br>' +
        '<button type="submit">Send Reset Link</button>' +
        '</form>',
    ),
  );
});

app.post('/reset-password', guestOnly, (req, res) => {
  const user = users.find((u) => u.email === req.body.email);

  if (user) {
    const resetToken = generateToken();

    tokens[resetToken] = { type: 'reset', userId: user.id };

    // eslint-disable-next-line no-console
    console.log(
      `\n[EMAIL] To: ${user.email}\n` +
        'Link: http://localhost:3000/reset-password-confirm?token=' +
        `${resetToken}\n`,
    );
  }

  res.send(
    renderPage(
      'Email Sent',
      '<p>If your email is in our database, you will receive a reset link.</p>',
    ),
  );
});

app.get('/reset-password-confirm', guestOnly, (req, res) => {
  const { token } = req.query;

  res.send(
    renderPage(
      'Confirm New Password',
      '<form method="POST" action="/reset-password-confirm">' +
        `<input type="hidden" name="token" value="${token}">` +
        // eslint-disable-next-line max-len
        '<label>New Password: <input type="password" name="password" required>' +
        '</label><br><br>' +
        '<label>Confirm Password: <input type="password" ' +
        'name="confirmPassword" required></label><br><br>' +
        '<button type="submit">Reset Password</button>' +
        '</form>',
    ),
  );
});

app.post('/reset-password-confirm', guestOnly, (req, res) => {
  const { token, password, confirmPassword } = req.body;
  const tokenData = tokens[token];

  if (!tokenData || tokenData.type !== 'reset') {
    return res.send(renderPage('Error', '<p>Invalid reset token.</p>'));
  }

  if (password !== confirmPassword) {
    return res.send(
      renderPage(
        'Error',
        '<p>Passwords do not match.</p>' +
          `<a href="/reset-password-confirm?token=${token}">Back</a>`,
      ),
    );
  }

  const user = users.find((u) => u.id === tokenData.userId);

  if (user) {
    user.password = password;
  }
  delete tokens[token];

  res.send(
    renderPage(
      'Success',
      '<p>Password successfully reset!</p><a href="/login">Go to Login</a>',
    ),
  );
});

app.post('/logout', authOnly, (req, res) => {
  const cookies = parseCookies(req.headers.cookie);

  delete sessions[cookies.sessionId];
  res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Path=/; Max-Age=0');
  res.redirect('/login');
});

app.get('/profile', authOnly, (req, res) => {
  const user = req.user;

  res.send(
    renderPage(
      'Profile',
      `<p>Welcome, ${user.name} (${user.email})</p>` +
        '<h3>Change Name</h3>' +
        '<form method="POST" action="/profile/name">' +
        `<input type="text" name="name" value="${user.name}" required>` +
        '<button type="submit">Update Name</button>' +
        '</form>' +
        '<h3>Change Password</h3>' +
        '<form method="POST" action="/profile/password">' +
        // eslint-disable-next-line max-len
        '<input type="password" name="oldPassword" placeholder="Old Password" ' +
        'required><br>' +
        // eslint-disable-next-line max-len
        '<input type="password" name="newPassword" placeholder="New Password" ' +
        'required><br>' +
        '<input type="password" name="confirmPassword" ' +
        'placeholder="Confirm New Password" required><br>' +
        '<button type="submit">Update Password</button>' +
        '</form>' +
        '<h3>Change Email</h3>' +
        '<form method="POST" action="/profile/email">' +
        // eslint-disable-next-line max-len
        '<input type="password" name="password" placeholder="Current Password"' +
        ' required><br>' +
        '<input type="email" name="newEmail" placeholder="New Email" ' +
        'required><br>' +
        '<button type="submit">Update Email</button>' +
        '</form><br>' +
        '<form method="POST" action="/logout">' +
        '<button type="submit">Logout</button></form>',
    ),
  );
});

app.post('/profile/name', authOnly, (req, res) => {
  req.user.name = req.body.name;
  res.redirect('/profile');
});

app.post('/profile/password', authOnly, (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (req.user.password !== oldPassword) {
    return res.send(
      renderPage(
        'Error',
        '<p>Incorrect old password.</p><a href="/profile">Back</a>',
      ),
    );
  }

  if (newPassword !== confirmPassword) {
    return res.send(
      renderPage(
        'Error',
        '<p>New passwords do not match.</p><a href="/profile">Back</a>',
      ),
    );
  }
  req.user.password = newPassword;
  res.redirect('/profile');
});

app.post('/profile/email', authOnly, (req, res) => {
  const { password, newEmail } = req.body;

  if (req.user.password !== password) {
    return res.send(
      renderPage(
        'Error',
        '<p>Incorrect password.</p><a href="/profile">Back</a>',
      ),
    );
  }

  const oldEmail = req.user.email;
  const changeToken = generateToken();

  tokens[changeToken] = {
    type: 'email_change',
    userId: req.user.id,
    payload: newEmail,
  };

  // eslint-disable-next-line no-console
  console.log(
    `\n[EMAIL] To: ${oldEmail}\n` +
      `Security Alert: Your email is being changed to ${newEmail}.\n`,
  );

  // eslint-disable-next-line no-console
  console.log(
    `\n[EMAIL] To: ${newEmail}\n` +
      'Confirm link: http://localhost:3000/confirm-email?token=' +
      `${changeToken}\n`,
  );

  res.send(
    renderPage(
      'Email Change Requested',
      '<p>Please check your new email to confirm the change. ' +
        'A notification was sent to your old email.</p>' +
        '<a href="/profile">Back to Profile</a>',
    ),
  );
});

app.get('/confirm-email', (req, res) => {
  const { token } = req.query;
  const tokenData = tokens[token];

  if (!tokenData || tokenData.type !== 'email_change') {
    return res.send(renderPage('Error', '<p>Invalid email change link.</p>'));
  }

  const user = users.find((u) => u.id === tokenData.userId);

  if (user) {
    user.email = tokenData.payload;
  }
  delete tokens[token];

  res.send(
    renderPage(
      'Success',
      '<p>Email successfully updated!</p><a href="/profile">Go to Profile</a>',
    ),
  );
});

app.use((req, res) => {
  res
    .status(404)
    .send(
      renderPage(
        '404 Not Found',
        '<p>The page you are looking for does not exist.</p>',
      ),
    );
});

const PORT = 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth app running on http://localhost:${PORT}`);
});
