import { User } from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../exeptions/api.error.js";
import { emailService } from "./email.service.js";

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, email, name }) {
  return { id, email, name };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(email, password, name) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest("User already exist", {
      email: "User already exist",
    });
  }

  await User.create({ email, password, name, activationToken });

  await emailService.sendActivationEmail(email, activationToken);
}

async function reset(email) {
  const existUser = await findByEmail(email);

  if (!existUser) {
    throw ApiError.badRequest("User with this email does not exist", {
      email: "Wrong email",
    });
  }

  if (existUser.activationToken !== null) {
    throw ApiError.badRequest(
      "Please activate your account with activation link sent on your email"
    );
  }

  existUser.resetToken = uuidv4();
  existUser.save();

  await emailService.sendResetEmail(email, existUser.resetToken);
}



export const usersService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  reset,
};
