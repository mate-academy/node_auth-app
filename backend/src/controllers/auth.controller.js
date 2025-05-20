import { v4 as uuidV4 } from 'uuid';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { PASSWORD_PATTERN } from '../utils/constants.js';

const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      res.status(400).send('All fields are required');
      return;
    }

    if (!PASSWORD_PATTERN.test(password)) {
      res
        .status(400)
        .send(
          'Password must be at least 6 characters long and contain at least one letter and one number',
        );
      return;
    }

    const activationToken = uuidV4();
    const newUser = await User.create({
      email,
      password,
      username,
      activationToken,
    });

    await emailService.sendActivationEmail(email, activationToken);

    res.send(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  if (!activationToken) {
    res.status(400).send('Activation token is required');
    return;
  }

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  await user.update({ activationToken: null }, { where: { activationToken } });
  await user.save();

  res.send(user);
};

export const authController = {
  register,
  activate,
};
