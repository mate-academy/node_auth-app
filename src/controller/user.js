import { userService } from '../service/index.js';
import { userValidation } from '../validation/index.js';

const update = async (req, res) => {
  try {
    const { userId } = req.params;

    const dbUser = await userService.findById({ id: userId });

    if (!dbUser) {
      return res.status(404).send({ error: 'User not found' });
    }

    const validatedPassword = await userValidation.newPasswordSchema.validate(
      req.body,
    );
    const password = await userService.updatePassword(
      res,
      validatedPassword,
      dbUser,
    );

    if (password && typeof password !== 'string') {
      return password;
    }

    const validatedEmail = await userValidation.newEmailSchema.validate(
      req.body,
    );
    const email = await userService.updateEmail(res, validatedEmail, dbUser);

    if (email && typeof email !== 'string') {
      return email;
    }

    const validatedName = await userValidation.newNameSchema.validate(req.body);
    const name = await userService.updateName(validatedName);

    const data = Object.entries({ password, email, name }).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc[key] = value;
        }

        return acc;
      },
      {},
    );

    if (!Object.keys(data).length) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedUser = await userService.update({ data, id: userId });

    if (!updatedUser.success) {
      return res.status(400).send(updatedUser.error);
    }

    const user = await userService.findById({ id: userId });

    res.send(userService.dto(user));
  } catch (error) {
    if (error?.errors) {
      return res.status(400).send({ error: error.errors });
    }
    // eslint-disable-next-line no-console
    console.error(error);

    res.status(500).send();
  }
};

export const userController = {
  update,
};
