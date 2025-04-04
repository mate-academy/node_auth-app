import { User } from '../models/user.js';
import { PASSWORD_PATTERN } from '../utils/constants.js';

const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   res.status(400).send('Email is already in use');
    //   return;
    // }

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

    const newUser = await User.create({ email, password, username });

    res.send(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const authController = {
  register,
};
