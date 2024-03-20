import 'dotenv/config';
import bcrypt from 'bcrypt';
import type UserService from '../User/User.service.js';
import type { UserDTO } from './../User/User.types.js';
import type EmailService from '../Email/Email.service.js';

const { BCRYPT_SALT_ROUNDS } = process.env;

interface Services {
  userService: UserService;
  emailService: EmailService;
}

class AuthService {
  private readonly userService: UserService;
  private readonly emailService: EmailService;

  constructor({ userService, emailService }: Services) {
    this.userService = userService;
    this.emailService = emailService;
  }

  async register(userDTO: UserDTO, redirect?: string) {
    const { email, password } = userDTO;
    const user = await this.userService.getByEmail(email);

    if (user !== null) {
      throw new Error('User already exist');
    }

    const saltRounds = +(BCRYPT_SALT_ROUNDS ?? 10);
    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await this.userService.add({
      ...userDTO,
      password: encryptedPassword,
    });

    const { activationToken } = newUser;

    if (activationToken === null) {
      throw new Error('Activation token is not set. Error');
    }

    this.emailService.sendActivationEmail(email, activationToken, redirect).catch((err) => {
      // eslint-disable-next-line no-console
      console.log("Activation email wasn't send, error: ", err);
    });

    return newUser;
  }

  async activate(token: string) {
    const [activatedCount] = await this.userService.activate(token);

    if (activatedCount === 0) {
      throw new Error('Token is not valid');
    }

    if (activatedCount > 1) {
      throw new Error('Token is not unique');
    }
  }
}

export default AuthService;
