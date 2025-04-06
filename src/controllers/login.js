import { tokenRepository } from '../entity/token.repository.js';
import { usersRepository } from '../entity/users.repository.js';
import { tokenService } from '../utils/jwt.service.js';
import { normalizeUser } from './normalizers/normalizeUser.js';

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json('Inavalid data request');
  }

  try {
    const foundUser = await usersRepository.getByEmail(email);

    const isCompare = await usersRepository.findCompare(email, password);

    if (isCompare === undefined) {
      return res.status(404).json('User not found');
    } else if (isCompare === false) {
      return res.status(400).json('Wrong password');
    }

    const normazedUser = normalizeUser(foundUser);

    const newRefresh = tokenService.signRefresh(normazedUser);
    const newAccess = tokenService.sign(normazedUser);

    await tokenRepository.save(foundUser.id, newRefresh);

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.set('Authorization', `Bearer ${newAccess}`);

    return res.redirect('http://localhost:5700/users');
  } catch (err) {
    console.error(`catch error login ${err.message}`);
    res.status(500).json('Server error');
  }
}
