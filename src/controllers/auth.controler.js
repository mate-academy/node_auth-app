import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { User } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import { sendActivationEmail } from '../services/mail.service.js';

async function register(req, res) {
  const { name, email, password } = req.body;

  const activationToken = uuidv4();
  const user = await User.create({
    name,
    email,
    passwordHash: password,
    activationToken,
  });

  await sendActivationEmail(user.email, activationToken);

  res.status(StatusCodes.CREATED).send(user);
}

async function activate(req, res) {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
  }

  user.activationToken = null;
  await user.save();

  res.status(StatusCodes.OK).send(user);
}

export const authController = {
  register,
  activate,
};
