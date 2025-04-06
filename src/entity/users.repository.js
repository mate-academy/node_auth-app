import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function create(name, email, password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const activationToken = uuidv4();

  const created = await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  return created;
}

async function getById(userId) {
  const foundUser = await User.findOne({ where: { id: userId } });

  if (!foundUser) {
    return undefined;
  } else {
    return foundUser;
  }
}

async function getByEmail(email) {
  const foundUser = await User.findOne({ where: { email } });

  if (!foundUser) {
    return undefined;
  } else {
    return foundUser;
  }
}

async function getByToken(activationToken) {
  const foundUser = await User.findOne({ where: { activationToken } });

  if (!foundUser) {
    return undefined;
  }

  return foundUser;
}

async function findCompare(email, password) {
  const userToCompare = await User.findOne({ where: { email } });

  if (!userToCompare) {
    return undefined;
  }

  const isSamePassword = await bcrypt.compare(password, userToCompare.password);

  if (!isSamePassword) {
    return false;
  }

  return true;
}

async function checkCanChange(email) {
  try {
    const userToCheck = await getByEmail(email);

    if (!userToCheck) {
      return false;
    }

    const userDate = new Date(userToCheck.onChanging);
    const now = new Date();
    const difference = now - userDate;
    const formatted = difference / 1000 / 60;

    if (formatted > 30) {
      userToCheck.onChanging = null;
      await userToCheck.save();

      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.error(`catch error checkCanChange: ${err.message}`);

    return false;
  }
}

export const usersRepository = {
  create,
  getById,
  getByEmail,
  getByToken,
  findCompare,
  checkCanChange,
};
