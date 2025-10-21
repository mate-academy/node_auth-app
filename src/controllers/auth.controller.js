import { user } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

const registration = async (req, res) => {
  const { email, password } = req.body;

  const newUser = await user.create({ email, password });
  const token = uuidv4();
  await emailService.sendActivationEmail(email, token)
  res.send(newUser);
};

export const authController = {
  registration,
};
