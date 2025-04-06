import { usersRepository } from '../entity/users.repository.js';
import bcrypt from 'bcrypt';

export async function passwordChange(req, res) {
  const { email } = req.params;
  const { password1, password2 } = req.body;

  if (!email || password1 !== password2) {
    return res
      .status(400)
      .json('Email not found, or password are not the same');
  }

  try {
    const foundUser = await usersRepository.getByEmail(email);

    if (!foundUser) {
      return res.status(404).json('User not found');
    }

    const isCanChange = await usersRepository.checkCanChange(email);

    if (!isCanChange) {
      return res.status(403).json('this user is not available for changes');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password1, saltRounds);

    foundUser.password = hashedPassword;
    foundUser.onChanging = null;

    await foundUser.save();

    return res.status(200).json('password was been changed');
  } catch (err) {
    console.error(`catch error password controller: ${err.message}`);
    res.status(500).json('Server error');
  }
}
