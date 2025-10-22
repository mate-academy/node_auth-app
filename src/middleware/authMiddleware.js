const { verifyAccessToken, issueAccessToken, rotateRefreshToken } = require('../services/tokenService');

function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) const rt = req.cookies?.refreshToken;
    if (rt) {
      try {
        const rotated = await rotateRefreshToken(rt);
        const newAT = issueAccessToken(rotated.userId);
        res.cookie('accessToken', newAT, { httpOnly: true, sameSite: 'lax' });
        res.cookie('refreshToken', rotated.token, { httpOnly: true, sameSite: 'lax' });
        req.user = { id: rotated.userId };
        return next();
      } catch (e) {}
    }
    return res.status(401).json({ error: 'Unauthorized' });
};
    next();
  } catch (_e) {
    const rt = req.cookies?.refreshToken;
    if (rt) {
      try {
        const rotated = await rotateRefreshToken(rt);
        const newAT = issueAccessToken(rotated.userId);
        res.cookie('accessToken', newAT, { httpOnly: true, sameSite: 'lax' });
        res.cookie('refreshToken', rotated.token, { httpOnly: true, sameSite: 'lax' });
        req.user = { id: rotated.userId };
        return next();
      } catch (e) {}
    }
    return res.status(401).json({ error: 'Unauthorized' });
};
