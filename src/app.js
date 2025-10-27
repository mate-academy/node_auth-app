/* eslint-disable prettier/prettier */
'use strict';

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const methodOverride = require('./middleware/methodOverride.middleware');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const { db } = require('./models/db');

function page(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<style>
body{font-family:system-ui,Arial,sans-serif;max-width:680px;margin:40px auto;padding:0 16px;line-height:1.5}
input,button{padding:8px;margin:4px 0}
form{margin:16px 0;padding:12px;border:1px solid #ddd;border-radius:10px}
.hint{color:#666;font-size:0.9em}
.err{color:#b00020}
.ok{color:#0a7d00}
a.button{display:inline-block;padding:8px 12px;border:1px solid #333;border-radius:8px;text-decoration:none}
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function createApp() {
  const app = express();

  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(
    session({
      secret: 'dev-secret-change-me',
      resave: false,
      saveUninitialized: false,
      cookie: { sameSite: 'lax' },
    }),
  );

  app.use(methodOverride());

  app.get('/', (req, res) => {
    const logged = Boolean(req.session.userId);
    const email = db.usersById.get(req.session.userId)?.email;

    res.send(
      page(
        'Home',
        `
      <h1>Welcome</h1>
      ${
  logged
    ? `<p>Logged in as <strong>${email}</strong></p>
             <p><a class="button" href="/profile">Profile</a></p>
             <form method="post" action="/logout"><button>Logout</button></form>`
    : `<p>
               <a class="button" href="/register">Register</a>
               <a class="button" href="/login">Login</a>
             </p>`
}
    `,
      ),
    );
  });

  // Routes
  app.use(authRoutes);
  app.use(profileRoutes);

  // Dev helper: view last 20 “emails”
  app.get('/_outbox', (_req, res) => {
    res.json(db.outbox.slice(-20));
  });

  // 404
  app.use((req, res) => {
    res.status(404).send(
      page(
        'Not Found',
        `
      <h1>404 - Page not found</h1>
      <p>The page <code>${req.originalUrl}</code> does not exist.</p>
      <p><a href="/">Go Home</a></p>
    `,
      ),
    );
  });

  return app;
}

module.exports = { createApp, page };
