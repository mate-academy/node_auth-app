'use strict';

const asyncHandler = require('../utils/asyncHandler');

function createAuthMiddleware(sessionService) {
  const loadSession = asyncHandler(async (req, res, next) => {
    const user = await sessionService.resolveUser(req);

    Object.defineProperty(req, 'user', {
      configurable: true,
      value: user,
      writable: true,
    });
    next();
  });

  function requireAuth(req, res, next) {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });

      return;
    }

    next();
  }

  function guestOnly(req, res, next) {
    if (req.user) {
      res.status(403).json({
        message: 'This action is available only to unauthenticated users',
      });

      return;
    }

    next();
  }

  return {
    guestOnly,
    loadSession,
    requireAuth,
  };
}

module.exports = createAuthMiddleware;
