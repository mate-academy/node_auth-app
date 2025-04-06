import { usersRepository } from '../entity/users.repository.js';
import { mailService } from '../utils/mailer.js';
import { validateEmail } from './normalizers/validateEmail.js';
import { validatePassword } from './normalizers/validatePassword.js';

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json('Invalid data request');
  }

  try {
    const errors = {
      name: name ? null : 'Name is required',
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (Object.values(errors).some((error) => error || !name)) {
      res.status(400).json({
        errors,
      });

      return;
    }

    const isExist = await usersRepository.getByEmail(email);

    if (isExist) {
      res.status(400).json('This email is already exist');

      return;
    }

    const newUser = await usersRepository.create(name, email, password);

    mailService.send(
      email,
      'Activation',
      mailService.generateActivateLink(newUser.activationToken),
    );

    res
      .status(201)
      .json(`User created. Activation token is ${newUser.activationToken}`);
  } catch (err) {
    console.error(`catch error register: ${err.message}`);
    res.status(500).json('Server error');
  }
}
