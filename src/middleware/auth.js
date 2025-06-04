const { verifyAccessToken } = require('../utils/jwt');
const { prisma } = require('../config/database');

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        redirect: '/login',
      });
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        redirect: '/login',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account not activated',
        redirect: '/activate',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid access token',
      redirect: '/login',
    });
  }
};

const requireGuest = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (token) {
    try {
      verifyAccessToken(token);

      return res.status(403).json({
        success: false,
        message: 'Already authenticated',
        redirect: '/profile',
      });
    } catch (error) {
      // Token is invalid, continue as guest
    }
  }

  next();
};

module.exports = {
  requireAuth,
  requireGuest,
};
