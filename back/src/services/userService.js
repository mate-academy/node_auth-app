/* eslint-disable quotes */
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { emailService } from "../services/emailService.js";
import { ApiError } from "../exceptions/ApiError.js";
import { User } from "../models/user.js";

function getAllActive() {
  return User.findAll({
    where: { activationToken: null },
    order: ["id"],
  });
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function normalize({ id, email, fullName }) {
  return {
    id,
    email,
    fullName,
  };
}

async function register({ email, fullName, password }) {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest("Validation error", {
      email: "Email is already taken",
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  const registeredUser = await User.create({
    email,
    fullName,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);

  return registeredUser;
}

async function reset(email, password) {
  const user = await getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest("Validation error", {
      email: "Email is wrong",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  user.password = hash;
  user.recoverToken = null;

  await user.save();
}

async function updateName(email, fullName) {
  const user = await getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest("Validation error", {
      email: "Email is wrong",
    });
  }

  user.fullName = fullName;

  await user.save();
}

async function updateEmail(oldEmail, newEmail) {
  const user = await getByEmail(oldEmail);

  if (!user) {
    throw ApiError.BadRequest("Validation error", {
      email: "Email is wrong",
    });
  }

  const activationToken = uuidv4();

  user.email = newEmail;

  user.activationToken = activationToken;

  await emailService.sendActivationLink(newEmail, activationToken);
  await emailService.sendEmailChanged(oldEmail);
  await user.save();

  return user;
}

export const userService = {
  getAllActive,
  normalize,
  getByEmail,
  register,
  reset,
  updateName,
  updateEmail,
};

uuidv4();
