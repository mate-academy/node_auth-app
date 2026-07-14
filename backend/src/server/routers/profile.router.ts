import { Router, type Request, type Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.ts';
import { userService } from '../../services/user.service.ts';
import { validation } from '../../utils/validation.ts';
import bcrypt from 'bcrypt';
import { mailer } from '../../services/mailer.services.ts';
import { jwtService } from '../../services/jwt.service.ts';

export const profileRoute: Router = Router();

profileRoute.post(
  '/change-name',
  authMiddleware,
  async (
    req: Request<
      {},
      {},
      { firstName: string | undefined; lastName: string | undefined }
    >,
    res: Response,
  ) => {
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .send({ message: 'In request dont have firstName or lastName' });
    }

    const errorValidations = Object.fromEntries(
      Object.entries({
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

    const updatedUser = await userService.update(res.locals.normalizedUser.id, {
      firstName,
      lastName,
    });

    if (!updatedUser) {
      return res.status(404).send({ message: 'Not found user' });
    }

    res.send({
      user: userService.normalize(updatedUser),
      message: 'The user has been successfully renamed.',
    });
  },
);

profileRoute.post(
  '/change-email',
  authMiddleware,
  async (
    req: Request<
      {},
      {},
      { password: string | undefined; newEmail: string | undefined }
    >,
    res: Response,
  ) => {
    const { password, newEmail } = req.body;

    if (!password || !newEmail) {
      return res
        .status(400)
        .send({ message: 'In request dont have password or newEmail' });
    }

    const errorValidations = Object.fromEntries(
      Object.entries({
        password: validation.validatePassword(password),
        newEmail: validation.validateEmail(newEmail),
      }).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(errorValidations).length > 0) {
      return res.status(400).json({
        message: 'Any field is invalid',
        errors: errorValidations,
      });
    }

    const userWithNewEmail = await userService.getByEmail(newEmail);

    if (userWithNewEmail) {
      return res.status(409).send({ message: 'Email already in use' });
    }

    const userByEmail = await userService.getByEmail(
      res.locals.normalizedUser.email,
    );

    if (!userByEmail) {
      return res.status(404).send({ message: 'Not found user' });
    }

    if (!bcrypt.compareSync(password, userByEmail.password)) {
      return res.status(400).send({ message: 'Password is not correct' });
    }

    const resetEmailToken = jwtService.resetEmailToken.sign({
      ...userService.normalize(userByEmail),
      newEmail,
    });

    await userService.update(userByEmail.id, { resetEmailToken });
    await mailer.sendResetEmailToken(newEmail, resetEmailToken);

    res.send({
      message: 'An activation email has been sent to a new email address.',
    });
  },
);

profileRoute.post(
  '/change-password',
  authMiddleware,
  async (
    req: Request<
      {},
      {},
      {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
      }
    >,
    res: Response,
  ) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).send({
        message:
          'In request dont have currentPassword or newPassword or confirmNewPassword',
      });
    }

    const errorValidations = Object.fromEntries(
      Object.entries({
        currentPassword: validation.validatePassword(currentPassword),
        newPassword: validation.validatePassword(newPassword),
        confirmNewPassword: validation.validatePassword(confirmNewPassword),
      }).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(errorValidations).length > 0) {
      return res.status(400).json({
        message: 'Any field is invalid',
        errors: errorValidations,
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).send({
        message: 'New password must be different from current password',
      });
    }

    if (confirmNewPassword !== newPassword) {
      return res.status(400).send({
        message: 'The confirm new password does not match the new password',
      });
    }

    const user = await userService.getById(res.locals.normalizedUser.id);

    if (!user) {
      return res.status(404).send({ message: 'Not found user' });
    }

    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).send({ message: 'Password is not correct' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

    await userService.update(user.id, { password: hashedNewPassword });
    res.send({ message: 'Password is updated' });
  },
);

profileRoute.get(
  '/change-email/confirm/:resetEmailToken',
  async (req: Request<{ resetEmailToken: string }, {}, {}>, res: Response) => {
    const { resetEmailToken } = req.params;

    if (!resetEmailToken) {
      return res.sendStatus(400);
    }

    const payloadResetEmail =
      jwtService.resetEmailToken.verify(resetEmailToken);

    if (!payloadResetEmail) {
      return res.status(404).json({ message: 'Not found token' });
    }

    const userById = await userService.getById(payloadResetEmail.id);

    if (!userById) {
      return res.status(404).send({ message: 'Not found user' });
    }

    if (userById.resetEmailToken !== resetEmailToken) {
      return res.status(404).send({ message: 'Not found token' });
    }

    const userWithNewEmail = await userService.getByEmail(
      payloadResetEmail.newEmail,
    );

    if (userWithNewEmail && userWithNewEmail.id !== userById.id) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    await userService.update(userById.id, {
      email: payloadResetEmail.newEmail,
      resetEmailToken: null,
    });

    res.send({
      message: 'Email has changed',
    });
  },
);
