import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import normalizeUser from './normalizeUser.js';

export async function generateTokens(res, user) {
  const normalized = normalizeUser(user);
  const accessToken = jwtService.sign(normalized);
  const refreshToken = jwtService.signRefresh(normalized);

  await tokenService.save(normalized.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalized,
    accessToken,
  });
}
