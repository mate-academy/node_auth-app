import { userService } from '../services/user.service.js';

function setRefreshTokenCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
  });
}

export const authController = {
  async register(req, res) {
    const { name, email, password } = req.body;
    const user = await userService.register({ name, email, password });

    res.status(201).send(user);
  },

  async activate(req, res) {
    const { activationToken } = req.params;

    await userService.activate(activationToken);

    res.redirect(`${process.env.CLIENT_URL}/profile`);
  },

  async login(req, res) {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await userService.login({
      email,
      password,
    });

    setRefreshTokenCookie(res, refreshToken);

    res.send({ user, accessToken });
  },

  async logout(req, res) {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const userData = await userService.refresh(refreshToken);

      if (userData) {
        await userService.logout(userData.user.id);
      }
    }

    res.clearCookie('refreshToken');
    res.sendStatus(204);
  },

  async refresh(req, res) {
    const { refreshToken } = req.cookies;
    const data = await userService.refresh(refreshToken);

    setRefreshTokenCookie(res, data.refreshToken);

    res.send({
      user: data.user,
      accessToken: data.accessToken,
    });
  },
};
