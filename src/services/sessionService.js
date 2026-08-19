'use strict';

const env = require('../config/env');
const {
  appendSetCookie,
  parseCookies,
  serializeCookie,
} = require('../utils/cookies');
const { createToken, hashToken } = require('../utils/token');

const COOKIE_NAME = 'session';

function createSessionService(sessions) {
  const ttl = env.sessionDays * 24 * 60 * 60 * 1000;

  function cookieOptions(maxAge) {
    return {
      maxAge,
      path: '/',
      httpOnly: true,
      secure: env.cookieSecure || env.nodeEnv === 'production',
      sameSite: 'Lax',
    };
  }

  async function createSession(user, res) {
    const token = createToken();
    const expiresAt = new Date(Date.now() + ttl);

    await sessions.create({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    });

    appendSetCookie(
      res,
      serializeCookie(COOKIE_NAME, token, cookieOptions(ttl)),
    );
  }

  async function resolveUser(req) {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME];

    if (!token) {
      return null;
    }

    const tokenHash = hashToken(token);
    const session = await sessions.findByTokenHash(tokenHash);

    if (!session) {
      return null;
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      await sessions.deleteByTokenHash(tokenHash);

      return null;
    }

    if (!session.user || !session.user.isActive) {
      return null;
    }

    return session.user;
  }

  async function logout(req, res) {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME];

    if (token) {
      await sessions.deleteByTokenHash(hashToken(token));
    }

    appendSetCookie(res, serializeCookie(COOKIE_NAME, '', cookieOptions(0)));
  }

  return {
    createSession,
    logout,
    resolveUser,
    revokeAllForUser(userId) {
      return sessions.deleteAllForUser(userId);
    },
  };
}

module.exports = createSessionService;
