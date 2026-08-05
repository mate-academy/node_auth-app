import { User } from '../users/User.model.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.sendStatus(409);
    }

    const user = await User.create({ name, email, password });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

export const login = async (req, res) => {};

export const activate = async (req, res) => {};

