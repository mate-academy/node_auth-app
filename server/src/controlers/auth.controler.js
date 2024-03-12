const authService = require("../services/auth.services");
const jwtService = require("../services/jwt.services");

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

  try {
    const newUser = await authService.create({ email, password });
    res.send(newUser);
  } catch (error) {
    console.log(`Internal server found: ${error}`);
    res.send(500);
  }
};

const login = async (req, res) => {
  console.log("it works, login");
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

module.exports = { getAll, register, login };
