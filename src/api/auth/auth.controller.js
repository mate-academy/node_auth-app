import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/User.model.js';
import { emailService } from '../../services/email.service.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.sendStatus(409);
    }

    const activationToken = uuidv4();

    const newUser = await User.create({ name, email, password, activationToken });

    await emailService.sendActivationMail({ email, activationToken });

    res.send(newUser);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

export const login = async (req, res) => {};

export const activate = async (req, res) => {
    const { activationToken } = req.params;

    const user = await User.findOne({ where: { activationToken } });

    if (!user) {
        return res.sendStatus(404);
    }

    user.activationToken = null;

    await user.save();

    res.send(user);
};

export const authController = {
    register,
    login,
    activate
}

