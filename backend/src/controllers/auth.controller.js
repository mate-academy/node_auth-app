import { hashPassword, comparePassword } from '../utils/hash.js';
import { User, Token } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';
import { createToken } from '../services/token.service.js';
import { sendEmail } from '../services/email.service.js';

export async function register(req, res) {
  const { nameRegister, email, password } = req.body;

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name: nameRegister,
    email,
    password_hash: passwordHash,
    is_active: false,
  });

  const token = await createToken(user.id, 'activation', 60);

  await sendEmail(
    email,
    'Activate your account',
    `Link: http://localhost:3000/active?token=${token.token}`,
  );

  res.status(201).json({ message: 'User created. Check your email.' });
}

export async function activate(req, res) {
  const { token } = req.query;

  const activation = await Token.findOne({
    where: { token, type: 'activation' },
  });

  if (!activation || activation.expires_at < new Date()) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  const user = await User.findByPk(activation.user_id);

  user.is_active = true;
  await user.save();

  await activation.destroy();

  const jwt = generateToken({ id: user.id });

  res.json({ token: jwt });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.is_active) {
    return res.status(403).json({ message: 'Activate your account' });
  }

  const valid = await comparePassword(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken({ id: user.id });

  res.json({ token });
}
