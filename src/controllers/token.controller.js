import * as tokenService from '../services/refreshToken.service.js';

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      message: 'Refresh token missing',
    });
  }

  const accessToken = await tokenService.refreshAccessToken(refreshToken);

  if (!accessToken) {
    return res.status(401).json({
      message: 'Refresh token invalid or expired',
    });
  }

  return res.status(200).json({ accessToken });
};
