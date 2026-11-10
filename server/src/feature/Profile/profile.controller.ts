import type { Response } from "express";
import { jwt } from "../../config/jwt.js";
import type { User } from "../../models/User.model.js";
import { userRepository } from "../User/user.repository.js";
import type { AuthRequest } from "../../middlewares/authMiddleware.js";
import bcrypt from 'bcrypt';
import { checkPassword } from "../../middlewares/checkPassword.js";
import { mailer } from "../../config/mailer.js";

function normalize({ id, name, email }: User) {
  return { id, name, email };
}

const getOwner = async (req: AuthRequest, res: Response) => {
  const currentUser = await userRepository.getByEmail(req.user.email) as User | null;

  if (!currentUser) {
    return res.status(401).json({
      message: "User not found",
    })
  }

  return res.status(200).json(
    normalize(currentUser),
  )
};

const changeName = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const updatedUser = await userRepository.update(req.user.id, { name });

  if (updatedUser.name !== name) {
    return res.sendStatus(500);
  }

  return res.sendStatus(204);
};

const changePassword = async (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const {email} = req.user;

  const user = await userRepository.getByEmail(email);

  await checkPassword(res, user, oldPassword);

  if (newPassword !== confirmation) {
    res.status(400).json({ message: 'Password not confirmed' });
  }

  const password = await bcrypt.hash(newPassword, 10);
  await userRepository.update(user.id, {password});

  return res.status(201).json({
    message: 'Your password has been changed successfully.',
  })
};

const changeEmail = async (req: AuthRequest, res: Response) => {
  const { newEmail, password, emailConfirmation } = req.body;
  const {email} = req.user;

  const user = await userRepository.getByEmail(email);

  await checkPassword(res, user, password);

  if (newEmail !== emailConfirmation) {
    res.status(400).json({ message: 'Email not confirmed' });
  }

  const existingUser = await userRepository.getByEmail(newEmail);

  if (existingUser) {
    res.status(400).json({ message: 'User with this email already exists' });
  }

  await userRepository.update(user.id, { email: newEmail });

  mailer.sendChangingEmail(user?.email, newEmail);

  return res.status(204).json({
    message: 'Your email has been changed successfully.',
  })

};


export const profileController = {
  getOwner,
  changeName,
  changePassword,
  changeEmail,
};

