const { verifyAccessToken } = require('../services/tokenService');

function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (_e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };
