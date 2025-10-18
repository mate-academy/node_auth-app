// src/middleware/guest.js
const { verifyAccessToken } = require('../services/tokenService');
const prisma = require('../services/prisma');

/**
 * Guest middleware:
 * - Bloqueia se houver access token válido
 * - OU se houver refresh cookie válido e não expirado no DB
 */
module.exports = async function guest(req, res, next) {
  try {
    const bearer = req.header('Authorization')?.replace('Bearer ', '');
    const cookieAT = req.cookies?.accessToken;
    const token = bearer || cookieAT;

    if (token) {
      verifyAccessToken(token);
      return res.status(403).json({ error: 'Already authenticated' });
    }

    const rt = req.cookies?.refreshToken;
    if (rt) {
      const found = await prisma.refreshToken.findUnique({ where: { token: rt } });
      if (found && !found.revokedAt && found.expiresAt >= new Date()) {
        return res.status(403).json({ error: 'Already authenticated' });
      }
    }

    return next();
  } catch {
    return next(); // se access quebrado, trata como guest
  }
};
