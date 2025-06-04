const { prisma } = require('../config/database');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

const saveRefreshToken = async (userId, refreshToken) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });
};

const removeRefreshToken = async (token) => {
  await prisma.refreshToken.delete({
    where: { token },
  });
};

const findRefreshToken = async (token) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
};

const removeAllUserTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

const removeExpiredTokens = async () => {
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

const generateTokens = async (user) => {
  const payload = { userId: user.id };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
};

const refreshTokens = async (refreshToken) => {
  try {
    verifyRefreshToken(refreshToken);

    const tokenRecord = await findRefreshToken(refreshToken);

    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    // Remove old refresh token
    await removeRefreshToken(refreshToken);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      tokenRecord.user,
    );

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

module.exports = {
  saveRefreshToken,
  removeRefreshToken,
  findRefreshToken,
  removeAllUserTokens,
  removeExpiredTokens,
  generateTokens,
  refreshTokens,
};
