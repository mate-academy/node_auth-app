import { usersRepository } from '../entity/users.repository.js';
import { mailService } from '../utils/mailer.js';

export async function changePass(req, res, next) {
  if (req.params.email) {
    return next();
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json('Invalid data request');
  }

  try {
    const foundUser = await usersRepository.getByEmail(email);

    if (!foundUser) {
      return res.status(404).json('User not found');
    }

    if (foundUser.onChanging === null) {
      foundUser.onChanging = new Date();

      await foundUser.save();

      const generatedLink = mailService.generateAproveLink('password', email);

      await mailService.send(email, 'Password confirm', generatedLink);

      res.status(200).json('Confirm list was sent to email');
    } else {
      next();
    }
  } catch (err) {
    console.error(`catch error meddleware change pass: ${err.message}`);
    res.status(500).json('Server error');
  }
}
