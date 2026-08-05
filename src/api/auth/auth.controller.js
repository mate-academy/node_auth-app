import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/User.model.js';
import { emailService } from '../../services/email.service.js';
import * as usersService from '../users/users.service.js';
import { jwtService } from '../../services/jwt.service.js';

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

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await usersService.findByEmail(email);

    if (!user || user.password !== password) {
        return res.sendStatus(401);
    }

    if (user.activationToken) {
        return res.status(403).send('User is not activated');
    }

    const normalizedUser = usersService.normalize(user);
    const accessToken = jwtService.sign(normalizedUser);

    res.send({
        user: normalizedUser,
        accessToken
    });
};

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

