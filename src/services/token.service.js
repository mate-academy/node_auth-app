import { Token } from "../models/token.js";

const save = async (userId, newToken) => {
  const token = await Token.findOne({ where: { UserId: userId }});

  if (!token) {
    await Token.create({ refreshToken: newToken, UserId: userId });
    return;
  }

  token.refreshToken = newToken;
  await token.save();
};

const getByToken = async (refreshToken) => {
  return Token.findOne({ where: { refreshToken }})
};


export const tokenService = {
  save,
  getByToken,
}
