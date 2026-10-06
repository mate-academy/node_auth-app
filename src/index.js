'use strict';

require('dotenv').config();

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const { rateLimit } = require('express-rate-limit');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { PASSWORD_RULES } = require('./utils/password');
const { sequelize } = require('./db');
const { csrf } = require('./middleware/csrf');
const { register } = require('./controllers/registration');
const { accountRouter } = require('./routes/account');
const { passwordResetRouter } = require('./routes/passwordReset');
const { profileRouter } = require('./routes/profile');

require('./models/User.model');
require('./models/Token.model');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET) {
  throw new Error('Brakuje SESSION_SECRET w pliku .env');
}

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
});

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zbyt wiele prób rejestracji. Spróbuj za 15 minut.',
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    strictTransportSecurity: isProduction,
  }),
);

app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));

app.use(
  session({
    name: 'auth.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(csrf);

app.get('/', (req, res) => {
  res.redirect('/register');
});

app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/profile');
  }

  return res.render('register', {
    error: null,
    values: {
      name: '',
      email: '',
    },
    passwordRules: PASSWORD_RULES,
    csrfToken: req.session.csrfToken,
  });
});

app.post('/register', registrationLimiter, register);

app.use(accountRouter);
app.use(passwordResetRouter);
app.use(profileRouter);

app.use((req, res) => {
  res.status(404).send('404 — Nie znaleziono strony.');
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  process.stderr.write(`Błąd aplikacji: ${error.message}\n`);

  return res.status(500).send('Błąd serwera. Spróbuj ponownie później.');
});

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();

  app.listen(port, () => {
    process.stdout.write(`Serwer działa: http://localhost:${port}\n`);
  });
}

start().catch((error) => {
  process.stderr.write(`Nie udało się uruchomić serwera: ${error.message}\n`);
  sessionStore.stopExpiringSessions();
  sequelize.close();
  process.exitCode = 1;
});
