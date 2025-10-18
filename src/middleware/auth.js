// src/middleware/auth.js
const { verifyAccessToken, rotateRefreshToken, issueAccessToken } = require('../services/tokenService');

/**
 * Auth middleware:
 * - Tenta validar o access token (header Bearer ou cookie)
 * - Se inválido/ausente, tenta refresh cookie no DB:
 *    - Se ok, rotaciona refresh, emite novo access, setta cookies e continua
 *    - Se falhar, 401
 */
module.exports = async function auth(req, res, next) {
  try {
    const bearer = req.header('Authorization')?.replace('Bearer ', '');
    const cookieAT = req.cookies?.accessToken;
    const token = bearer || cookieAT;

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub };
      return next();
    }

    // fallback: tentar refresh
    const oldRT = req.cookies?.refreshToken;
    if (!oldRT) return res.status(401).json({ error: 'Unauthorized' });

    const { userId, token: newRT } = await rotateRefreshToken(oldRT);
    const newAT = issueAccessToken(userId);

    // setar novos cookies e seguir
    res.cookie('accessToken', newAT, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', newRT, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    req.user = { id: userId };
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
