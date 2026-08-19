'use strict';

const cors = require('cors');
const express = require('express');

const env = require('./config/env');
const createAuthController = require('./controllers/authController');
const createPageController = require('./controllers/pageController');
const createPasswordController = require('./controllers/passwordController');
const createProfileController = require('./controllers/profileController');
const createAuthMiddleware = require('./middleware/auth');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const createSessionRepository = require('./repositories/sessionRepository');
const createUserRepository = require('./repositories/userRepository');
const createAuthRouter = require('./routes/auth');
const createPagesRouter = require('./routes/pages');
const createPasswordRouter = require('./routes/password');
const createProfileRouter = require('./routes/profile');
const createAuthService = require('./services/authService');
const createEmailService = require('./services/emailService');
const createProfileService = require('./services/profileService');
const createSessionService = require('./services/sessionService');

function createRuntime(adapters = {}) {
  const users = adapters.users || createUserRepository();
  const sessions = adapters.sessions || createSessionRepository();
  const mailer = adapters.mailer || createEmailService();
  const authService = createAuthService(users, mailer);
  const sessionService = createSessionService(sessions);
  const profileService = createProfileService(users, sessions, mailer);
  const authMiddleware = createAuthMiddleware(sessionService);

  return {
    authController: createAuthController(authService, sessionService),
    authMiddleware,
    mailer,
    pageController: createPageController(
      authService,
      profileService,
      sessionService,
    ),
    passwordController: createPasswordController(
      authService,
      sessionService,
    ),
    profileController: createProfileController(
      profileService,
      sessionService,
    ),
  };
}

function createApp(adapters = {}) {
  const runtime = createRuntime(adapters);
  const app = express();

  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '32kb' }));
  app.use(express.urlencoded({ extended: false, limit: '32kb' }));
  app.use(runtime.authMiddleware.loadSession);
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  app.use(
    '/api/auth',
    createAuthRouter(runtime.authController, runtime.authMiddleware),
  );
  app.use(
    '/api/password',
    createPasswordRouter(runtime.passwordController, runtime.authMiddleware),
  );
  app.use(
    '/api/profile',
    createProfileRouter(runtime.profileController, runtime.authMiddleware),
  );
  app.use(createPagesRouter(runtime.pageController));
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.locals.authRuntime = runtime;

  return app;
}

module.exports = {
  createApp,
  createRuntime,
};
