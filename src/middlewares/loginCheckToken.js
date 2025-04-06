/* eslint-disable no-console */
import { tokenRepository } from '../entity/token.repository.js';
import { usersRepository } from '../entity/users.repository.js';
import { tokenService } from '../utils/jwt.service.js';

export async function loginCheckToken(req, res, next) {
  const { email } = req.body;
  const { accessToken, refreshToken } = await tokenRepository.getTokens(req);

  try {
    if (!email) {
      res.status(400).json('Invalid data request');

      return;
    }

    const currentUser = await usersRepository.getByEmail(email);

    if (!currentUser) {
      return res.status(404).json('User not found');
    }

    const dbRefresh = await tokenRepository.getRefreshToken(currentUser.id);

    const isMatchAccess = tokenService.verify(accessToken);
    const isMatchRefresh =
      dbRefresh && !!tokenService.verifyRefresh(dbRefresh.refreshToken);

    const isAliveRefresh = dbRefresh.refreshToken === refreshToken;

    if (isMatchAccess && isMatchRefresh && isAliveRefresh) {
      return res.redirect('http://localhost:5700/users');
    } else if (!isMatchAccess && isMatchRefresh && isAliveRefresh) {
      const newAccess = tokenService.sign({
        name: currentUser.name,
        email: currentUser.email,
      });

      res.set('Authorization', `Bearer ${newAccess}`);

      return res.redirect('http://localhost:5700/users');
    }
    next();
  } catch (err) {
    console.error(`catch error meddleware login: ${err.message}`);
    res.status(500).json('Server error');
  }
}
