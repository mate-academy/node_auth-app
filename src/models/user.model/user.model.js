const { User } = require('./user.postgresql');

function userNormalize({ id, name, email }) {
  return { id, name, email };
}

async function createUser(name, email, password, activationToken) {
  const user = await findUserByMail(email);

  if (user) {
    await User.update({ activationToken }, { where: { email } });

    return user;
  }

  return User.create({
    name,
    email,
    password,
    activationToken,
  });
}

async function createUserWithoutToken({ name, email, password }) {
  const newUser = await User.create({
    name,
    email,
    password,
  });

  return newUser;
}

async function findUserByMail(email) {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return false;
  }

  return user;
}

async function findUserByToken(token) {
  try {
    const user = await User.findOne({ where: { activationToken: token } });

    user.activationToken = null;
    user.save();

    return user;
  } catch (e) {
    return e;
  }
}

module.exports = {
  createUser,
  userNormalize,
  findUserByToken,
  findUserByMail,
  createUserWithoutToken,
};
