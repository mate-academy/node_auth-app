import { User } from "../models/User.js";

const register = async(email, password, activationToken) => {
  return User.create({email, password, activationToken});
};

const getOneUserByActToken = async(activationToken) => {
  return User.findOne({ where: { activationToken }});
};

const getOneUserByEmail = async(email) => {
  return User.findOne({ where: { email }});
};

export const authService = {
  register, getOneUserByActToken, getOneUserByEmail
};
