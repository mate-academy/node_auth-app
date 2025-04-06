import usersRepository from '../entity/users.repository.js';
import { normalizeUser } from './normalizers/normalizeUser.js';
import { tokenService } from '../utils/jwt.service.js';
import { tokenRepository } from '../entity/token.repository.js';

export async function activate(req, res) {
  const activationToken = req.params.token;

  try {
    if (!activationToken) {
      res.status(400).json('Activation token is required');

      return;
    }

    const currentUser = await usersRepository.getByToken(activationToken);

    if (!currentUser) {
      res.status(404).json('User not found');

      return;
    }

    currentUser.isActivated = true;
    currentUser.activationToken = null;
    await currentUser.save();

    const normazedUser = normalizeUser(currentUser);

    const accessToken = tokenService.sign(normazedUser);
    const refreshToken = tokenService.signRefresh(normazedUser);

    await tokenRepository.save(currentUser.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.set('Authorization', `Bearer ${accessToken}`);

    return res.json('success');
  } catch (err) {
    console.error(`catch error activate: ${err.message}`);
    res.status(500).json('Server error');
  }
}
