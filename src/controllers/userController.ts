import { Request, Response } from 'express';
import {
  changeEmail,
  changeName,
  changePassword,
} from '../services/userService';

export const updateEmail = async (req: Request, res: Response) => {
  try {
    const oldEmail = (req as any).user.email;
    const { newEmail, password } = req.body;

    await changeEmail(oldEmail, newEmail, password);

    res
      .status(200)
      .send({ message: 'Лист для підтвердження відправлено на нову пошту' });
  } catch (error) {
    res.status(400).send({ error: (error as Error).message });
  }
};

export const updateName = async (req: Request, res: Response) => {
  try {
    const email = (req as any).user.email;
    const { newName } = req.body;

    await changeName(email, newName);

    res.status(200).send({ message: "Ім'я змінено" });
  } catch (error) {
    res.status(400).send({ error: (error as Error).message });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const email = (req as any).user.email;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      throw new Error('Паролі не збігаються');
    }

    await changePassword(email, oldPassword, newPassword);

    res.status(200).send({ message: 'Пароль змінено' });
  } catch (error) {
    res.status(400).send({ error: (error as Error).message });
  }
};
