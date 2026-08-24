'use strict';

const express = require('express');

const defaultConfig = require('./config');
const { createMailer } = require('./mailer');
const {
  createSignedValue,
  hashPassword,
  newToken,
  normalizeEmail,
  readSignedValue,
  safeEqual,
  tokenDigest,
  validatePassword,
  verifyPassword,
} = require('./security');
const { Store } = require('./store');
const {
  forgotPasswordPage,
  inboxPage,
  loginPage,
  messagePage,
  notFoundPage,
  profilePage,
  registerPage,
  resetPasswordPage,
} = require('./views');

const SESSION_COOKIE = 'northstar_session';
const CSRF_COOKIE = 'northstar_csrf';
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const parseCookies = (header = '') =>
  Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([key, value]) => key && value)
      .map(([key, ...parts]) => [key, decodeURIComponent(parts.join('='))]),
  );

const cleanName = (value = '') => value.trim().replace(/\s+/g, ' ');
const isEmail = (value) =>
  value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const escapeEmailHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const createRateLimit = ({ limit, windowMs }) => {
  const attempts = new Map();

  return (request, response, next) => {
    const key = `${request.ip}:${request.path}`;
    const now = Date.now();
    const recent = (attempts.get(key) || []).filter(
      (timestamp) => timestamp > now - windowMs,
    );

    recent.push(now);
    attempts.set(key, recent);

    if (recent.length > limit) {
      response.status(429).send(
        messagePage({
          eyebrow: 'Please slow down',
          title: 'Too many attempts',
          message: 'Wait a few minutes, then try again.',
          actionHref: request.path,
          actionLabel: 'Try again',
          state: 'error',
        }),
      );

      return;
    }

    next();
  };
};

const createApp = (options = {}) => {
  const config = { ...defaultConfig, ...options.config };
  const store = options.store || new Store(config.dataFile);
  const mailer = options.mailer || createMailer(config, store);
  const app = express();
  const sensitiveRateLimit = createRateLimit({
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    express.urlencoded({
      extended: false,
      limit: '20kb',
    }),
  );

  app.use(
    express.static(`${__dirname}/public`, {
      maxAge: config.isProduction ? DAY : 0,
    }),
  );

  app.use((request, response, next) => {
    response.set({
      'Content-Security-Policy':
        "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });
    next();
  });

  app.use(async (request, response, next) => {
    try {
      const cookies = parseCookies(request.headers.cookie);
      const sessionId = cookies[SESSION_COOKIE]
        ? readSignedValue(cookies[SESSION_COOKIE], config.sessionSecret)
        : null;

      request.cookies = cookies;
      request.sessionId = sessionId;
      request.user = null;

      if (sessionId) {
        const session = await store.findSession(sessionId);

        if (session) {
          request.user = await store.findUserById(session.userId);
        }
      }

      let csrf = cookies[CSRF_COOKIE]
        ? readSignedValue(cookies[CSRF_COOKIE], config.sessionSecret)
        : null;

      if (!csrf) {
        csrf = newToken();

        response.cookie(
          CSRF_COOKIE,
          createSignedValue(csrf, config.sessionSecret),
          {
            httpOnly: true,
            sameSite: 'strict',
            secure: config.isProduction,
            maxAge: DAY,
            path: '/',
          },
        );
      }

      request.csrf = csrf;
      next();
    } catch (error) {
      next(error);
    }
  });

  app.use((request, response, next) => {
    if (request.method !== 'POST') {
      next();

      return;
    }

    if (!safeEqual(request.body._csrf, request.csrf)) {
      response.status(403).send(
        messagePage({
          eyebrow: 'Request expired',
          title: 'Let’s try that again',
          message: 'Refresh the page before submitting the form again.',
          actionHref: request.path,
          actionLabel: 'Refresh page',
          state: 'error',
        }),
      );

      return;
    }

    next();
  });

  const onlyGuest = (request, response, next) => {
    if (request.user) {
      response.redirect(303, '/profile');

      return;
    }

    next();
  };

  const onlyAuthenticated = (request, response, next) => {
    if (!request.user) {
      response.redirect(303, '/login');

      return;
    }

    next();
  };

  const issueToken = async (userId, purpose, expiresIn, metadata = {}) => {
    const token = newToken();

    await store.createToken({
      digest: tokenDigest(token),
      userId,
      purpose,
      expiresAt: Date.now() + expiresIn,
      ...metadata,
    });

    return token;
  };

  const startSession = async (response, userId) => {
    const id = newToken();

    await store.createSession(userId, {
      id,
      expiresAt: Date.now() + 7 * DAY,
    });

    response.cookie(
      SESSION_COOKIE,
      createSignedValue(id, config.sessionSecret),
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProduction,
        maxAge: 7 * DAY,
        path: '/',
      },
    );
  };

  const sendActivationEmail = async (user) => {
    const token = await issueToken(user.id, 'activation', DAY);
    const link = `${config.appUrl}/activate?token=${encodeURIComponent(token)}`;

    await mailer.send({
      to: user.email,
      subject: 'Activate your Northstar account',
      text: `Welcome to Northstar. Activate your account: ${link}`,
      html: `<p>Hi ${escapeEmailHtml(user.name)},</p><p>Welcome to Northstar. Confirm your email to activate your account.</p><p><a href="${link}">Activate my account</a></p><p>This link expires in 24 hours.</p>`,
    });
  };

  app.get('/', (request, response) => {
    response.redirect(303, request.user ? '/profile' : '/login');
  });

  app.get('/register', onlyGuest, (request, response) => {
    response.send(registerPage({ csrf: request.csrf }));
  });

  app.post(
    '/register',
    onlyGuest,
    sensitiveRateLimit,
    async (request, response) => {
      const name = cleanName(request.body.name);
      const email = normalizeEmail(request.body.email);
      const password = request.body.password || '';
      const passwordProblems = validatePassword(password);
      let error = '';

      if (name.length < 2 || name.length > 80) {
        error = 'Enter a name between 2 and 80 characters.';
      } else if (!isEmail(email)) {
        error = 'Enter a valid email address.';
      } else if (passwordProblems.length) {
        error = `Your password still needs: ${passwordProblems.join(', ').toLowerCase()}.`;
      } else if (await store.findUserByEmail(email)) {
        error = 'An account with this email already exists.';
      }

      if (error) {
        response.status(422).send(
          registerPage({
            csrf: request.csrf,
            error,
            values: { name, email },
          }),
        );

        return;
      }

      const user = await store.createUser({
        name,
        email,
        passwordHash: await hashPassword(password),
      });

      await sendActivationEmail(user);

      response.redirect(
        303,
        `/activation-sent?email=${encodeURIComponent(email)}`,
      );
    },
  );

  app.get('/activation-sent', onlyGuest, (request, response) => {
    response.send(
      messagePage({
        eyebrow: 'Check your inbox',
        title: 'Activate your account',
        message: `We sent an activation link to ${normalizeEmail(request.query.email)}.`,
        detail:
          'The link expires in 24 hours. Check your spam folder if it doesn’t arrive.',
        actionHref: '/login',
        actionLabel: 'Go to sign in',
        secondary: config.isProduction
          ? ''
          : 'Developing locally? <a href="/dev/emails">Open the email preview</a>',
      }),
    );
  });

  app.post(
    '/resend-activation',
    onlyGuest,
    sensitiveRateLimit,
    async (request, response) => {
      const email = normalizeEmail(request.body.email);
      const user = await store.findUserByEmail(email);

      if (user && !user.active) {
        await sendActivationEmail(user);
      }

      response.redirect(
        303,
        `/activation-sent?email=${encodeURIComponent(email)}`,
      );
    },
  );

  app.get('/activate', onlyGuest, async (request, response) => {
    const token = await store.consumeToken(
      tokenDigest(request.query.token || ''),
      'activation',
    );

    if (!token) {
      response.status(400).send(
        messagePage({
          eyebrow: 'Link unavailable',
          title: 'This activation link has expired',
          message:
            'Sign in with your details to request a fresh activation email.',
          actionHref: '/login',
          actionLabel: 'Go to sign in',
          state: 'error',
        }),
      );

      return;
    }

    const user = await store.updateUser(token.userId, { active: true });

    await startSession(response, user.id);
    response.redirect(303, '/profile?notice=activated');
  });

  app.get('/login', onlyGuest, (request, response) => {
    response.send(loginPage({ csrf: request.csrf }));
  });

  app.post(
    '/login',
    onlyGuest,
    sensitiveRateLimit,
    async (request, response) => {
      const email = normalizeEmail(request.body.email);
      const user = await store.findUserByEmail(email);

      if (
        !user ||
        !(await verifyPassword(request.body.password || '', user.passwordHash))
      ) {
        response.status(401).send(
          loginPage({
            csrf: request.csrf,
            email,
            error: 'Email or password is incorrect.',
          }),
        );

        return;
      }

      if (!user.active) {
        response.status(403).send(
          loginPage({
            csrf: request.csrf,
            email,
            error: 'Activate your email before signing in.',
            inactive: true,
          }),
        );

        return;
      }

      await startSession(response, user.id);
      response.redirect(303, '/profile');
    },
  );

  app.post('/logout', onlyAuthenticated, async (request, response) => {
    await store.deleteSession(request.sessionId);
    response.clearCookie(SESSION_COOKIE, { path: '/' });
    response.redirect(303, '/login');
  });

  app.get('/forgot-password', onlyGuest, (request, response) => {
    response.send(forgotPasswordPage({ csrf: request.csrf }));
  });

  app.post(
    '/forgot-password',
    onlyGuest,
    sensitiveRateLimit,
    async (request, response) => {
      const email = normalizeEmail(request.body.email);

      if (!isEmail(email)) {
        response.status(422).send(
          forgotPasswordPage({
            csrf: request.csrf,
            email,
            error: 'Enter a valid email address.',
          }),
        );

        return;
      }

      const user = await store.findUserByEmail(email);

      if (user && user.active) {
        const token = await issueToken(user.id, 'password-reset', HOUR);
        const link = `${config.appUrl}/reset-password?token=${encodeURIComponent(token)}`;

        await mailer.send({
          to: user.email,
          subject: 'Reset your Northstar password',
          text: `Reset your password: ${link}`,
          html: `<p>Hi ${escapeEmailHtml(user.name)},</p><p>Use this secure link to choose a new password:</p><p><a href="${link}">Reset my password</a></p><p>This link expires in one hour. If you didn’t request it, no action is needed.</p>`,
        });
      }

      response.redirect(
        303,
        `/reset-email-sent?email=${encodeURIComponent(email)}`,
      );
    },
  );

  app.get('/reset-email-sent', onlyGuest, (request, response) => {
    response.send(
      messagePage({
        eyebrow: 'Check your inbox',
        title: 'Your reset link is on its way',
        message: `If an active account exists for ${normalizeEmail(request.query.email)}, we’ve sent a password reset link.`,
        detail: 'For your security, the link expires in one hour.',
        actionHref: '/login',
        actionLabel: 'Back to sign in',
        secondary: config.isProduction
          ? ''
          : 'Developing locally? <a href="/dev/emails">Open the email preview</a>',
      }),
    );
  });

  app.get('/reset-password', onlyGuest, (request, response) => {
    if (!request.query.token) {
      response.status(400).send(
        messagePage({
          eyebrow: 'Link unavailable',
          title: 'A reset link is required',
          message: 'Request a new password reset email to continue.',
          actionHref: '/forgot-password',
          actionLabel: 'Request a reset link',
          state: 'error',
        }),
      );

      return;
    }

    response.send(
      resetPasswordPage({ csrf: request.csrf, token: request.query.token }),
    );
  });

  app.post(
    '/reset-password',
    onlyGuest,
    sensitiveRateLimit,
    async (request, response) => {
      const password = request.body.password || '';
      const confirmation = request.body.confirmation || '';
      const passwordProblems = validatePassword(password);
      let error = '';

      if (passwordProblems.length) {
        error = `Your password still needs: ${passwordProblems.join(', ').toLowerCase()}.`;
      } else if (password !== confirmation) {
        error = 'The password confirmation does not match.';
      }

      if (error) {
        response.status(422).send(
          resetPasswordPage({
            csrf: request.csrf,
            token: request.body.token,
            error,
          }),
        );

        return;
      }

      const token = await store.consumeToken(
        tokenDigest(request.body.token || ''),
        'password-reset',
      );

      if (!token) {
        response.status(400).send(
          messagePage({
            eyebrow: 'Link unavailable',
            title: 'This reset link has expired',
            message:
              'Request a fresh link and we’ll get you back into your account.',
            actionHref: '/forgot-password',
            actionLabel: 'Request a new link',
            state: 'error',
          }),
        );

        return;
      }

      await store.updateUser(token.userId, {
        passwordHash: await hashPassword(password),
      });
      await store.deleteUserSessions(token.userId);

      response.send(
        messagePage({
          eyebrow: 'Password updated',
          title: 'You’re all set',
          message: 'Your password has been changed successfully.',
          detail: 'Use your new password the next time you sign in.',
          actionHref: '/login',
          actionLabel: 'Sign in',
          state: 'success',
        }),
      );
    },
  );

  app.get('/profile', onlyAuthenticated, (request, response) => {
    const notices = {
      activated: 'Your email is verified and your account is ready.',
      name: 'Your name has been updated.',
      password: 'Your password has been updated.',
      'email-sent': 'Check your new inbox to confirm the email change.',
      email: 'Your email address has been updated.',
    };

    response.send(
      profilePage({
        csrf: request.csrf,
        user: request.user,
        notice: notices[request.query.notice] || '',
      }),
    );
  });

  app.post('/profile/name', onlyAuthenticated, async (request, response) => {
    const name = cleanName(request.body.name);

    if (name.length < 2 || name.length > 80) {
      response.status(422).send(
        profilePage({
          csrf: request.csrf,
          user: request.user,
          error: 'Enter a name between 2 and 80 characters.',
        }),
      );

      return;
    }

    await store.updateUser(request.user.id, { name });
    response.redirect(303, '/profile?notice=name');
  });

  app.post(
    '/profile/password',
    onlyAuthenticated,
    sensitiveRateLimit,
    async (request, response) => {
      const password = request.body.password || '';
      const passwordProblems = validatePassword(password);
      let error = '';

      if (
        !(await verifyPassword(
          request.body.oldPassword || '',
          request.user.passwordHash,
        ))
      ) {
        error = 'Your current password is incorrect.';
      } else if (passwordProblems.length) {
        error = `Your new password still needs: ${passwordProblems.join(', ').toLowerCase()}.`;
      } else if (password !== request.body.confirmation) {
        error = 'The new password confirmation does not match.';
      } else if (await verifyPassword(password, request.user.passwordHash)) {
        error = 'Choose a password you haven’t already used here.';
      }

      if (error) {
        response.status(422).send(
          profilePage({
            csrf: request.csrf,
            user: request.user,
            error,
            section: 'password',
          }),
        );

        return;
      }

      await store.updateUser(request.user.id, {
        passwordHash: await hashPassword(password),
      });
      await store.deleteUserSessions(request.user.id);
      await startSession(response, request.user.id);
      response.redirect(303, '/profile?notice=password');
    },
  );

  app.post(
    '/profile/email',
    onlyAuthenticated,
    sensitiveRateLimit,
    async (request, response) => {
      const email = normalizeEmail(request.body.email);
      let error = '';

      if (!isEmail(email)) {
        error = 'Enter a valid email address.';
      } else if (email === request.user.email) {
        error = 'That is already your current email address.';
      } else if (await store.findUserByEmail(email)) {
        error = 'An account with this email already exists.';
      } else if (
        !(await verifyPassword(
          request.body.password || '',
          request.user.passwordHash,
        ))
      ) {
        error = 'Your current password is incorrect.';
      }

      if (error) {
        response.status(422).send(
          profilePage({
            csrf: request.csrf,
            user: request.user,
            error,
            section: 'email',
          }),
        );

        return;
      }

      const token = await issueToken(request.user.id, 'email-change', HOUR, {
        newEmail: email,
        oldEmail: request.user.email,
      });
      const link = `${config.appUrl}/confirm-email?token=${encodeURIComponent(token)}`;

      await Promise.all([
        mailer.send({
          to: email,
          subject: 'Confirm your new Northstar email',
          text: `Confirm your new email address: ${link}`,
          html: `<p>Hi ${escapeEmailHtml(request.user.name)},</p><p>Confirm this email address to use it for your Northstar account.</p><p><a href="${link}">Confirm new email</a></p><p>This link expires in one hour.</p>`,
        }),
        mailer.send({
          to: request.user.email,
          subject: 'A change to your Northstar email was requested',
          text: `A request was made to change your account email to ${email}. If this wasn’t you, change your password immediately.`,
          html: `<p>Hi ${escapeEmailHtml(request.user.name)},</p><p>A request was made to change your Northstar email to <strong>${escapeEmailHtml(email)}</strong>.</p><p>If this wasn’t you, sign in and change your password immediately.</p>`,
        }),
      ]);

      response.redirect(303, '/profile?notice=email-sent');
    },
  );

  app.get('/confirm-email', async (request, response) => {
    const token = await store.consumeToken(
      tokenDigest(request.query.token || ''),
      'email-change',
    );

    if (!token) {
      response.status(400).send(
        messagePage({
          eyebrow: 'Link unavailable',
          title: 'This confirmation link has expired',
          message: 'Return to your profile to request the email change again.',
          actionHref: request.user ? '/profile' : '/login',
          actionLabel: request.user ? 'Return to profile' : 'Sign in',
          state: 'error',
        }),
      );

      return;
    }

    const emailOwner = await store.findUserByEmail(token.newEmail);

    if (emailOwner && emailOwner.id !== token.userId) {
      response.status(409).send(
        messagePage({
          eyebrow: 'Email unavailable',
          title: 'That email is already in use',
          message: 'Choose another email address from your profile.',
          actionHref: request.user ? '/profile' : '/login',
          actionLabel: request.user ? 'Return to profile' : 'Sign in',
          state: 'error',
        }),
      );

      return;
    }

    const user = await store.updateUser(token.userId, {
      email: token.newEmail,
    });

    await mailer.send({
      to: token.oldEmail,
      subject: 'Your Northstar email was changed',
      text: `Your Northstar account email is now ${token.newEmail}.`,
      html: `<p>Hi ${escapeEmailHtml(user.name)},</p><p>Your Northstar account email was changed to <strong>${escapeEmailHtml(token.newEmail)}</strong>.</p><p>If you did not make this change, contact support immediately.</p>`,
    });

    if (request.user && request.user.id === token.userId) {
      response.redirect(303, '/profile?notice=email');

      return;
    }

    response.send(
      messagePage({
        eyebrow: 'Email updated',
        title: 'Your new email is confirmed',
        message: 'Use your new email address the next time you sign in.',
        actionHref: '/login',
        actionLabel: 'Go to sign in',
        state: 'success',
      }),
    );
  });

  if (!config.isProduction) {
    app.get('/dev/emails', async (request, response) => {
      response.send(inboxPage({ emails: await store.listEmails() }));
    });
  }

  app.use((request, response) => {
    response.status(404).send(notFoundPage());
  });

  app.use((error, request, response, next) => {
    console.error(error);

    if (response.headersSent) {
      next(error);

      return;
    }

    response.status(500).send(
      messagePage({
        eyebrow: 'Something went wrong',
        title: 'We hit an unexpected snag',
        message: 'Your information is safe. Please try again in a moment.',
        actionHref: '/',
        actionLabel: 'Return home',
        state: 'error',
      }),
    );
  });

  return { app, store };
};

module.exports = { createApp };
