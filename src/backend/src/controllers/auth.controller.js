'use strict';

const { passport, isGithubAuthEnabled } = require('../config/passport');
const authService = require('../services/auth.service');
const {
  finalizeGitHubAuthentication,
} = require('../services/githubAuth.service');
const jwtService = require('../services/jwt.service');
const userService = require('../services/user.service');
const { ApiError } = require('../utils/ApiError');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    await authService.register({ name, email, password });

    res.status(201).json({
      message: 'Registered. Check your email for the activation link.',
    });
  } catch (error) {
    next(error);
  }
}

async function activate(req, res, next) {
  try {
    const { hash } = req.params;
    const user = await authService.activate(hash);

    const token = jwtService.sign({ id: user.id, email: user.email });
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const search = new URLSearchParams({
      accessToken: token,
      flow: 'registration',
    });

    res.redirect(`${clientUrl}/activation?${search.toString()}`);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email = '', password = '' } = req.body;
    const result = await authService.login({ email, password });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

function logout(req, res, next) {
  const clearSessionCookie = () => {
    res.clearCookie('connect.sid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  };

  if (!req.session) {
    clearSessionCookie();
    res.json({ message: 'Logged out successfully.' });

    return;
  }

  req.session.destroy((error) => {
    if (error) {
      next(error);

      return;
    }

    clearSessionCookie();
    res.json({ message: 'Logged out successfully.' });
  });
}

async function requestPasswordReset(req, res, next) {
  try {
    const { email = '' } = req.body;

    await authService.requestPasswordReset({ email });

    res.json({
      message: 'If an account exists for that email, we sent a reset link.',
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token = '', password = '' } = req.body;

    await authService.resetPassword({ token, password });

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
}

async function confirmEmailChange(req, res, next) {
  try {
    const { token = '' } = req.params;
    const user = await userService.confirmEmailChange(token);
    const accessToken = jwtService.sign({ id: user.id, email: user.email });
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const search = new URLSearchParams({
      accessToken,
      flow: 'email-change',
    });

    res.redirect(`${clientUrl}/activation?${search.toString()}`);
  } catch (error) {
    next(error);
  }
}

function buildClientRedirect(pathname, params = {}) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const redirectUrl = new URL(pathname, clientUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      redirectUrl.searchParams.set(key, value);
    }
  });

  return redirectUrl.toString();
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);

        return;
      }

      resolve();
    });
  });
}

function destroySession(req) {
  if (!req.session) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    req.session.destroy(() => resolve());
  });
}

async function startGithubAuthentication(req, res, next) {
  try {
    if (!isGithubAuthEnabled()) {
      throw ApiError.badRequest('GitHub sign-in is not configured.');
    }

    req.session.githubAuth = {
      intent: 'authenticate',
    };

    await saveSession(req);

    const serverUrl = process.env.SERVER_URL || 'http://localhost:4000';

    res.json({
      url: `${serverUrl}/auth/github`,
    });
  } catch (error) {
    next(error);
  }
}

async function startGithubLink(req, res, next) {
  try {
    if (!isGithubAuthEnabled()) {
      throw ApiError.badRequest('GitHub sign-in is not configured.');
    }

    req.session.githubAuth = {
      intent: 'link',
      userId: req.user.id,
    };

    await saveSession(req);

    const serverUrl = process.env.SERVER_URL || 'http://localhost:4000';

    res.json({
      url: `${serverUrl}/auth/github`,
    });
  } catch (error) {
    next(error);
  }
}

function githubAuthenticate(req, res, next) {
  if (!isGithubAuthEnabled()) {
    next(ApiError.badRequest('GitHub sign-in is not configured.'));

    return;
  }

  passport.authenticate('github', {
    scope: ['user:email'],
    session: false,
    state: true,
  })(req, res, next);
}

function githubCallback(req, res, next) {
  if (!isGithubAuthEnabled()) {
    next(ApiError.badRequest('GitHub sign-in is not configured.'));

    return;
  }

  passport.authenticate(
    'github',
    {
      session: false,
    },
    async (error, profile) => {
      const sessionData = req.session?.githubAuth || {
        intent: 'authenticate',
      };

      const isLinkFlow = sessionData.intent === 'link';
      const fallbackRedirect = isLinkFlow ? '/account' : '/login';

      if (error || !profile) {
        await destroySession(req);

        res.redirect(
          buildClientRedirect(fallbackRedirect, {
            error: 'GitHub authentication failed. Please try again.',
          }),
        );

        return;
      }

      try {
        const result = await finalizeGitHubAuthentication(
          profile,
          isLinkFlow ? sessionData.userId : null,
        );

        await destroySession(req);

        res.redirect(
          buildClientRedirect(result.redirectPath, {
            accessToken: result.accessToken,
            notice: result.message,
          }),
        );
      } catch (authError) {
        await destroySession(req);

        res.redirect(
          buildClientRedirect(fallbackRedirect, {
            error: authError.message,
          }),
        );
      }
    },
  )(req, res, next);
}

// eslint-disable-next-line object-curly-newline
module.exports = {
  register,
  activate,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  confirmEmailChange,
  startGithubAuthentication,
  startGithubLink,
  githubAuthenticate,
  githubCallback,
};
