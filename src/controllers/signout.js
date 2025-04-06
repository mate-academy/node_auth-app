import { tokenRepository } from '../entity/token.repository.js';
import { usersRepository } from '../entity/users.repository.js';

export async function signOut(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json('Invalid data request');
  }

  try {
    const foundUser = await usersRepository.getByEmail(email);

    if (!foundUser) {
      return res.status(404).json('User not found');
    }

    const foundToken = tokenRepository.getRefreshToken(foundUser.id);

    if (foundToken) {
      await tokenRepository.deleteToken(foundToken.id);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.set('Authorization', '');

    res.status(200).json('Successfully signed out');
  } catch (err) {
    console.error(`catch error sign out: ${err.message}`);
    res.status(500).json('Server error');
  }
}
