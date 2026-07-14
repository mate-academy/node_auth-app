import { Router, type Request, type Response } from 'express';
import { type UserSelect } from '../../db/schema/users.ts';
import bcrypt from 'bcrypt';
import { mailer } from '../../services/mailer.services.ts';
import { validation } from '../../utils/validation.ts';
import { jwtService } from '../../services/jwt.service.ts';
import {
  userService,
  type NormalizedUser,
} from '../../services/user.service.ts';
import cookieParser from 'cookie-parser';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

export const authRoute: Router = Router();

interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

async function sendAuthentication(res: Response, user: UserSelect) {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.accessToken.sign(normalizedUser);
  const refreshToken = jwtService.refreshToken.sign(normalizedUser);

  await userService.update(normalizedUser.id, { refreshToken });

  res.cookie('refreshToken', refreshToken, {
    maxAge: 10 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.send({ user: normalizedUser, accessToken });
}

authRoute.post(
  '/register',
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.sendStatus(400);
      return;
    }

    const errorValidations = Object.fromEntries(
      Object.entries({
        email: validation.validateEmail(email),
        password: validation.validatePassword(password),
        firstName: validation.validateName(firstName),
        lastName: validation.validateName(lastName),
      }).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(errorValidations).length > 0) {
      return res.status(400).json({
        message: 'Any field is invalid',
        errors: errorValidations,
      });
    }

    const existUser = await userService.getByEmail(email);

    if (existUser) {
      // User already exists
      if (existUser.isActivated) {
        return res
          .status(409)
          .json({ message: `Email ${email} already exists` });
      }

      // User already exists, but he is not activated

      const hashPassword = bcrypt.hashSync(password, 10);

      const updatedUser = await userService.update(existUser.id, {
        firstName,
        lastName,
        password: hashPassword,
      });

      if (!updatedUser) {
        return res.sendStatus(500);
      }

      const activationToken = jwtService.activationToken.sign(
        userService.normalize(updatedUser),
      );

      await userService.update(updatedUser.id, { activationToken });

      await mailer.sendActivationToken(email, activationToken);

      return res.status(200).json({
        message: 'Activation link has been sent',
      });
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    const newUser = await userService.create({
      email,
      lastName,
      firstName,
      password: hashPassword,
    });

    if (!newUser) {
      return res.sendStatus(500);
    }

    const activationToken = jwtService.activationToken.sign(
      userService.normalize(newUser),
    );

    const updatedUser = await userService.update(newUser.id, {
      activationToken,
    });

    if (!updatedUser) {
      return res.sendStatus(500);
    }

    await mailer.sendActivationToken(email, activationToken);

    res.send({ user: userService.normalize(updatedUser) });
  },
);

authRoute.post(
  '/login',
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.sendStatus(400);
      return;
    }

    const errorValidations = Object.fromEntries(
      Object.entries({
        email: validation.validateEmail(email),
        password: validation.validatePassword(password),
      }).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(errorValidations).length > 0) {
      return res.status(400).json({
        message: 'Any field is invalid',
        errors: errorValidations,
      });
    }

    const user = await userService.getByEmail(email);

    if (!user) {
      return res
        .status(404)
        .json({ message: 'There is no such user. Please register' });
    }

    if (!user.isActivated) {
      if (
        user.activationToken &&
        jwtService.activationToken.verify(user.activationToken)
      )
        return res.status(400).json({
          message:
            'The activated link has been send on email. Please activate account',
        });

      return res.status(400).json({
        message: 'Activated link has been expired. Try registering again',
      });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.sendStatus(404);
    }

    sendAuthentication(res, user);
  },
);

authRoute.get('/me', authMiddleware, (req: Request, res: Response) => {
  res.send({
    user: res.locals.normalizedUser,
  });
});

authRoute.post(
  '/logout',
  cookieParser(),
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken || '';
    const refreshPayload = jwtService.refreshToken.verify(refreshToken);

    if (refreshPayload) {
      await userService.update(refreshPayload.id, { refreshToken: null });
    }

    res.clearCookie('refreshToken');
    res.sendStatus(204);
  },
);

authRoute.get('/refresh', cookieParser(), async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const refreshPayload = jwtService.refreshToken.verify(refreshToken);

  if (!refreshPayload) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const user = await userService.getById(refreshPayload.id);

  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  return sendAuthentication(res, user);
});

authRoute.post(
  '/forget-password',
  async (req: Request<{}, {}, { email?: string }>, res) => {
    const { email: reqEmail } = req.body;

    if (!reqEmail) {
      return res.sendStatus(400);
    }

    console.log(req.body);

    const error = validation.validateEmail(reqEmail);

    if (error) {
      return res.status(400).send({ error: { email: error } });
    }

    const user = await userService.getByEmail(reqEmail);

    if (user) {
      const token = await jwtService.resetPasswordToken.sign(
        userService.normalize(user),
      );
      await userService.update(user.id, { resetPasswordToken: token });

      await mailer.sendForgotPasswordToken(reqEmail, token);
    }

    res.send({ message: 'A recovery link was sent to your email.' });
  },
);

authRoute.post(
  '/reset-password',
  async (
    req: Request<
      {},
      {},
      { newPassword?: string; newPasswordConfirm: string; token: string }
    >,
    res,
  ) => {
    const { newPassword, newPasswordConfirm, token } = req.body;

    if (!newPassword || !newPasswordConfirm || !token) {
      return res.sendStatus(400);
    }

    const errorValidations = Object.fromEntries(
      Object.entries({
        newPassword: validation.validatePassword(newPassword),
        newPasswordConfirm: validation.validatePassword(newPasswordConfirm),
      }).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(errorValidations).length > 0) {
      return res.status(400).json({
        message: 'Any field is invalid',
        errors: errorValidations,
      });
    }

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({
        message: 'Any field is invalid',
        errors: {
          newPasswordConfirm: 'Confirm password does not match the password',
        },
      });
    }

    const payload = jwtService.resetPasswordToken.verify(token);
    console.log(payload);

    if (!payload) {
      return res.status(400).json({
        message: 'Token is not valid',
      });
    }

    const user = await userService.getById(payload.id);

    if (!user) {
      return res.status(404).json({
        message: 'Not found user',
      });
    }

    if (user.resetPasswordToken !== token) {
      return res.status(400).json({
        message: 'Token is not valid',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userService.update(user.id, {
      resetPasswordToken: null,
      password: hashedPassword,
    });

    res.send({ message: 'Password is updated' });
  },
);

type ActivationParams = {
  activationToken: string;
};

authRoute.get(
  '/activation/:activationToken',
  async (req: Request<ActivationParams, {}, RegisterBody>, res: Response) => {
    const { activationToken } = req.params;

    if (!activationToken) {
      return res.sendStatus(400);
    }

    const existUser = await userService.getByActivationToken(activationToken);

    if (!existUser) {
      return res.status(404).json({ message: 'Not found user' });
    }

    if (!existUser.activationToken) {
      return res.status(404).json({ message: 'Not found token' });
    }

    const verifyUser = jwtService.activationToken.verify(
      existUser.activationToken,
    );

    if (!verifyUser) {
      await userService.update(existUser.id, { activationToken: null });

      return res
        .status(400)
        .json({ message: 'Link has expired. Try registering again' });
    }

    await userService.update(existUser.id, {
      activationToken: null,
      isActivated: true,
    });

    res.send({ message: 'User is activated' });
  },
);
