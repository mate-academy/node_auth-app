import bcrypt from 'bcrypt';
import * as userService from '../services/user.service.js';
import * as validation from '../utils/validators.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validation.validateName(name),
    email: validation.validateEmail(email),
    password: validation.validatePassword(password),
  };

  if (Object.values(errors).some((error) => typeof error === 'string')) {
    res.status(400).send({ errors });

    return;
  }

  if (await userService.getByEmail(email)) {
    res.sendStatus(409);

    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userService.create({ name, email, passwordHash });

    res.status(201).send({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.sendStatus(409);

      return;
    }

    res.sendStatus(500);
  }
};
