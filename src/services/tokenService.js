// src/services/tokenService.js
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const prisma = require('./prisma');

const ACCESS_SECRET  = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'dev-secret';
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7d

exports.issueAccessToken = (userId) => {
  return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: '15m' });
};

exports.verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

exports.issueRefreshToken = async (userId) => {
  const token = randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return { token, expiresAt };
};

exports.rotateRefreshToken = async (oldToken) => {
  // 1) encontrar e validar expiry
  const rt = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!rt || rt.revokedAt || rt.expiresAt < new Date()) {
    // segurança: se encontrado expirado, apague
    if (rt && rt.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token: oldToken } });
    }
    throw new Error('Invalid or expired refresh token');
  }

  // 2) revogar o antigo e emitir novo (rotação)
  const newToken = randomBytes(48).toString('hex');
  const newExp = new Date(Date.now() + REFRESH_TTL_MS);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { token: oldToken },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: { token: newToken, userId: rt.userId, expiresAt: newExp },
    }),
  ]);

  return { userId: rt.userId, token: newToken, expiresAt: newExp };
};

// limpeza simples
exports.pruneExpired = async () => {
  await prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
};
