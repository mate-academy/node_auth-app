import { usersRepository } from '../entity/users.repository.js';
import { mailService } from '../utils/mailer.js';

export async function changeMail(req, res) {
  const { userId, newEmail } = req.params;

  if (!userId || !newEmail) {
    return res.status(400).json('Invalid request data');
  }

  try {
    const currentUser = await usersRepository.getById(userId);

    if (!currentUser) {
      return res.status(404).json('User not found');
    }

    const isCanChange = await usersRepository.checkCanChange(currentUser.email);

    if (!isCanChange) {
      return res.status(403).json('User is unaviable to changes');
    }

    const pastEmail = currentUser.email;

    currentUser.email = newEmail;
    currentUser.onChanging = null;
    await currentUser.save();

    await mailService.send(
      pastEmail,
      'Your account email was changed',
      `Now, your email on account is ${newEmail}`,
    );

    res.status(200).json('Email was successfully changed.');
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Server error');
  }
}
