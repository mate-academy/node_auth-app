import { v4 as uuidv4 } from 'uuid';
import {
  bcryptService,
  emailService,
  tokensService,
  userService,
} from '../service/index.js';
import UserSchema from '../model/user.js';
import { jwtService } from '../service/jwt.js';

import { userValidation } from '../validation/index.js';

const registration = async (req, res) => {
  try {
    const { email, password, name } =
      await userValidation.registerSchema.validate(req.body, {
        abortEarly: false,
      });

    const activationToken = uuidv4();
    const hashedPassword = await bcryptService.hash(password);

    const user = await userService.create({
      email,
      password: hashedPassword,
      name,
      activationToken,
    });

    if (!user) {
      return res.status(400).send();
    }

    await emailService.sendActivation({ email, activationToken });

    res.status(200).send();
  } catch (error) {
    if (error?.errors) {
      return res.status(400).send({ error: error.errors });
    }
    // eslint-disable-next-line no-console
    console.error(error);

    res.status(500).send();
  }
};

const activateUser = async (req, res) => {
  try {
    const { activationToken } = req.params;

    const user = await UserSchema.findOne({ where: { activationToken } });

    if (!user) {
      return res.status(404).send();
    }

    user.activationToken = null;
    await user.save(); // Save the updated user to the database

    res.send(userService.dto(user));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    res.status(500).send();
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = await userValidation.loginSchema.validate(
      req.body,
      {
        abortEarly: false,
      },
    );

    const user = await userService.findByEmail({ email });

    if (!user) {
      return res.status(401).send();
    }

    if (user.activationToken) {
      return res.status(403).send({
        error:
          'Account is not activated. Check your email for the activation link.',
      });
    }

    const isPasswordCorrect = await bcryptService.isPasswordCorrect(
      password,
      user.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).send();
    }

    await generateTokens(res, user);
  } catch (error) {
    if (error?.errors) {
      return res.status(401).send({ error: error.errors });
    }
    // eslint-disable-next-line no-console
    console.error(error);

    res.status(500).send();
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken = '' } = req.cookies;

    const user = jwtService.verifyRefresh(refreshToken);

    if (user) {
      await tokensService.deleteToken(user.id);
    }

    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    res.status(500).send();
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    const user = jwtService.verifyRefresh(refreshToken);
    const token = await tokensService.getByToken(refreshToken);

    if (!user || !token) {
      return res.status(401).send();
    }

    await generateTokens(res, user);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    res.status(500).send();
  }
};

const generateTokens = async (res, user) => {
  try {
    const userDto = userService.dto(user);

    const accessToken = jwtService.signAccess(userDto);
    const refreshToken = jwtService.signRefresh(userDto);

    await tokensService.save({ userId: userDto.id, newToken: refreshToken });

    res.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
    });

    res.send({
      accessToken,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    res.status(500).send();
  }
};

const passwordReset = () => {};

export const authController = {
  registration,
  activateUser,
  login,
  logout,
  refresh,
  passwordReset,
};
