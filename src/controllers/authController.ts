import { Request, Response } from 'express';
import {
  register,
  activate,
  login as log,
  refresh,
  logout as lout,
  forgotPassword as forgotPass,
  resetPassword as resetPass,
} from '../services/authService';

export const registration = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await register(name, email, password);

    res.status(201).send(newUser);
  } catch (error) {
    res.status(400).send({ error: (error as Error).message });
  }
};

export const activation = async (req: Request, res: Response) => {
  try {
    const activationToken = req.params.activationToken as string;

    await activate(activationToken);

    res.status(200).send('Акаунт активовано');
  } catch (error) {
    res.status(400).send({ error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const resObj = await log(email, password);

    res.cookie('refreshToken', resObj.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.send(200).send({ user: resObj.user, accessToken: resObj.accessToken });
  } catch (error) {
    res.send(401).send({ error: (error as Error).message });
  }
};

export const refreshing = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const result = await refresh(refreshToken);

    res.cookie('refreshToken', result.newRefreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.status(200).send(result.newAccessToken);
  } catch (error) {
    res.status(401).send({ error: (error as Error).message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    await lout(refreshToken);

    res.clearCookie('refreshToken');

    res.status(204).send({ message: 'Успішний вихід' });
  } catch (error) {
    res.status(400).send({ error: (error as Error).message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;

    await forgotPass(email);
    res.status(200).send({ message: 'Лист для відновлення пароля відправлено' });
  } catch (error) {
    res.status(400).send({ error: (error as Error).message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const resetToken = req.params.resetToken as string;

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      throw new Error('Паролі не збігаються');
    }

    await resetPass(resetToken, password);
    res.status(200).send({ message: 'Пароль успішно змінено' });
  } catch (error) {
    res.status(400).send({ error: (error as Error).message });
  }
};
