const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

async function saveRefreshToken(userId, refresh, expiresAt) {
  // um token ativo por usuário (opcional, mas recomendável)
  await prisma.token.deleteMany({ where: { userId } });
  return prisma.token.create({
    data: { userId, refresh, expiresAt },
  });
}

async function removeRefreshToken(refresh) {
  await prisma.token.deleteMany({ where: { refresh } });
}

async function findRefreshToken(refresh) {
  return prisma.token.findUnique({ where: { refresh } });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  saveRefreshToken,
  removeRefreshToken,
  findRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
