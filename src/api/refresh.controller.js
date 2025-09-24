const { db } = require('../utils/db');
const {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/jwt');

const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const stored = await db.token.findUnique({
      where: { refresh: refreshToken },
    });

    if (!stored) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return res
        .status(403)
        .json({ message: 'Invalid or expired refresh token' });
    }

    const user = await db.user.findUnique({ where: { id: payload.id } });

    if (!user || !user.isActive) {
      return res.status(403).json({ message: 'User not found or inactive' });
    }

    await db.token.delete({ where: { id: stored.id } });

    const newRefreshToken = generateRefreshToken(user);

    await db.token.create({
      data: {
        userId: user.id,
        refresh: newRefreshToken,
      },
    });

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      message: 'Token refreshed',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { refreshTokenController };
