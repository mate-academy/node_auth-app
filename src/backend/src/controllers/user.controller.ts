import { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { prisma } from '../lib/db.js';
import bcrypt from 'bcrypt';
import { sendEmail } from '../services/email.service.js';
async function getUsers(req: Request, res: Response) {
  const users = await userService.getPublicUsers();

  res.json(users);
}

async function updateName(req: Request, res: Response) {
  const { newName } = req.body;
  const user = req.user;

  await prisma.user.update({
    where: { id: user?.id },
    data: { name: newName },
  });

  res.json({ message: 'Name updated' });
}

async function updateEmail(req: Request, res: Response) {
  const { newEmail, password } = req.body;
  const userId = req.user?.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    res.sendStatus(500);
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }

  const emailExists = await prisma.user.findUnique({
    where: { email: newEmail },
  });
  if (emailExists) {
    return res.status(400).json({ error: 'Email already in use' });
  }
  sendEmail(user.email, {
    subject: 'Your email was changed',
    text: `Your Email was changed from ${user.email} to ${newEmail}`,
    html: '',
  });

  await prisma.user.update({
    where: { id: user?.id },
    data: { email: newEmail },
  });

  res.json({ message: 'Email was changed' });
}
async function updatePassword(req: Request, res: Response) {
  const { oldPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
  if (!user) {
    return res.sendStatus(500);
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);

  if (!isPasswordValid) {
    res.status(401);
    res.json('Old password are incorrect');
    return;
  }

  const saltRounds = 10;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  res.json({ message: 'password changed' });
}

export const userController = {
  getUsers,
  updateName,
  updateEmail,
  updatePassword,
};
