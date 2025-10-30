import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import bcrypt from 'bcrypt';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) =>
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: 'Email and password are required' });
    }

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return res.status(400).send({
        message: 'Invalid email or password format',
        errors: {
          email: !isEmailValid,
          password: !isPasswordValid,
        },
      });
    }

    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(409).send({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = uuidv4();

    await User.create({ email, password: hashedPassword, activationToken });
    await emailService.sendActivationEmail(email, activationToken);

    res.status(201).send({
      message:
        'User registered successfully. Check your email to activate your account.',
    });
  } catch (err) {
    res.status(500).send({ message: 'Server error', error: err.message });
  }
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.status(404).send({ message: 'Invalid activation token' });
  }

  await user.update({ activationToken: null });

  res.status(200).send({ message: 'Account activated successfully' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    return res.status(401).send({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).send({ message: 'Invalid email or password' });
  }

  if (user.activationToken) {
    return res.status(403).send({ message: 'Account not activated yet' });
  }

  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);

  res.status(200).send({ user: normalizedUser, accessToken });
};

const logout = (req, res) => {
  res.clearCookie('token');

  res.send({ message: 'Logged out successfully' });
};

export const authController = {
  register,
  activate,
  login,
  logout,
};
