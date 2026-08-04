const db = require('../utils/db');

async function findUserByEmail(email) {
  const user = await db.user.findUnique({
    where: { email },
  });

  return user;
}

async function findUserById(id) {
  const user = await db.user.findUnique({
    where: { id },
  });

  return user;
}

async function findTokenByUserId(userId) {
  const token = await db.token.findUnique({
    where: { userId },
  });

  return token;
}

async function findTokenByToken(token) {
  const tokenData = await db.token.findFirst({
    where: { token },
  });

  return tokenData;
}

async function createUser(userData) {
  const user = await db.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      activationToken: userData.activationToken,
    },
  });

  return user;
}

async function updateUser(id, data) {
  return db.user.update({
    where: { id },
    data,
  });
}

async function updateToken(userId, data) {
  return db.token.update({
    where: { userId },
    data,
  });
}

async function createToken(tokenData) {
  const token = await db.token.create({
    data: {
      userId: tokenData.userId,
      token: tokenData.token,
    },
  });

  return token;
}

async function deleteTokenByUserId(userId) {
  await db.token.delete({
    where: { userId },
  });
}

async function findUserByPendingEmailAndEmailChangeToken(
  pendingEmail,
  emailChangeToken,
) {
  const user = await db.user.findFirst({
    where: { pendingEmail, emailChangeToken },
  });

  return user;
}

module.exports = {
  findUserByEmail,
  findUserById,
  findTokenByUserId,
  findTokenByToken,
  createUser,
  updateUser,
  updateToken,
  createToken,
  deleteTokenByUserId,
  findUserByPendingEmailAndEmailChangeToken,
};
