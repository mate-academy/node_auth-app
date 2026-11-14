import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { emailService } from '../services/email.service.js';

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).send({ message: 'no data' });

    return;
  }

  if (await User.findOne({ where: { email } })) {
    res.status(409).send({ message: 'this email is already used' });

    return;
  }

  const securedPassword = await bcrypt.hash(password, 10);
  const activationToken = crypto.randomUUID();

  await User.create({
    name,
    email,
    password: securedPassword,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);

  res.status(201).send({ message: 'Check you email' });
}

export const authController = {
  register,
};
