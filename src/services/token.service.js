import nodeCrypto from 'crypto';
import { Token } from '../models/index.js';

function hashToken(rawToken) {
  return nodeCrypto.createHash('sha256').update(rawToken).digest('hex');
}

export const tokenService = {
  generateRawToken() {
    return nodeCrypto.randomBytes(32).toString('hex');
  },

  async createToken({ userId, type, expiresInMs, meta }) {
    const rawToken = this.generateRawToken();
    const tokenHash = hashToken(rawToken);

    await Token.create({
      userId,
      type,
      tokenHash,
      expiresAt: new Date(Date.now() + expiresInMs),
      meta: meta ?? null,
    });

    return rawToken;
  },

  async findValidToken(rawToken, type) {
    const tokenHash = hashToken(rawToken);

    return Token.findOne({
      where: {
        tokenHash,
        type,
        consumedAt: null,
      },
    });
  },

  async consumeToken(token) {
    token.consumedAt = new Date();
    await token.save();
  },
};
