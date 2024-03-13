const authService = require("../services/auth.services");
const jwtService = require("../services/jwt.services");
const emailService = require("../services/email.services");
const { v4 } = require("uuid");

const getAll = async (req, res) => {
  try {
    const users = await authService.getAll();
    res.send(users);
  } catch (error) {
    console.log(`Internal server found: ${error}`);
    res.send(500);
  }
};

const register = async (req, res) => {
  const { email, password } = req.body;
  const activationToken = v4();

  try {
    const newUser = await authService.create({
      email,
      password,
      activationToken,
    });

    emailService.sendActivationEmail(email, activationToken);
    res.send(newUser);
  } catch (error) {
    console.log(`Internal server found: ${error}`);
    res.send(500);
  }
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  try {
    const user = await authService.getByActivationToken(activationToken);

    console.log("user ", user);

    if (!user) {
      res.sendStatus(404);
      return;
    }

    user.activationToken = null;
    user.save();

    res.send(user);
  } catch (error) {
    console.log(`Internal server found: ${error}`);
    res.send(500);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authService.getByEmail(email);

    if (!user || user.password !== password) {
      res.sendStatus(401);
      return;
    }

    const accessToken = jwtService.sign(user.dataValues);
    const normilizedUser = authService.normalize(user);

    res.send({
      user: normilizedUser,
      accessToken,
    });
  } catch (e) {
    console.log(`Error found: ${e}`);
    res.sendStatus(500);
  }
};

async function logout(req, res, next) {
  const data = req;
  // add here code
  // res.sendStatus(204);

  console.log("logout server");
  res.end("logout server");
  console.log("data", data, data.cookies);
}

module.exports = { getAll, register, activate, login, logout };
