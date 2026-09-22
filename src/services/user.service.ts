import { User } from '../models/User';
import bcrypt from 'bcrypt';

export type NormalizedUser = ReturnType<typeof normalize>;

function normalize({ id, name, email }: User) {
  return { id, name, email };
}

const getByEmail = (email: string) => {
  return User.findOne({ where: { email } });
};

const getById = (id: number) => {
  return User.findByPk(id);
};

const create = (
  name: string,
  email: string,
  password: string,
  activationToken: string,
) => {
  return User.create({
    name,
    email,
    password,
    activationToken,
  });
};

const activate = async (email: string) => {
  const user = await getByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  user.activationToken = null;
  user.isActive = true;

  await user.save();

  return user;
};

const getAllActive = () => {
  return User.findAll({
    where: { activationToken: null },
  });
};

const updateResetToken = async (email: string, resetToken: string | null) => {
  await User.update({ resetToken }, { where: { email } });
};

const getByResetToken = (resetToken: string): Promise<User | null> => {
  return User.findOne({
    where: { resetToken },
  });
};

const createNewPassword = async (email: string, passwordHash: string) => {
  await User.update(
    {
      password: passwordHash,
      resetToken: null,
    },
    { where: { email } },
  );
};

const updateName = async (id: number, name: string) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  user.name = name;

  await user.save();

  return user;
};

const updatePassword = async (
  id: number,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new Error('Old password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  user.password = passwordHash;

  await user.save();

  return user;
};

const setPendingEmail = async (
  id: number,
  pendingEmail: string,
  emailChangeToken: string,
  emailChangeTokenExpires: Date,
) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  user.pendingEmail = pendingEmail;
  user.emailChangeToken = emailChangeToken;
  user.emailChangeTokenExpires = emailChangeTokenExpires;

  await user.save();

  return user;
};

const getByEmailChangeToken = async (emailChangeToken: string) => {
  return User.findOne({
    where: { emailChangeToken },
  });
};

const confirmEmailChange = async (user: User) => {
  if (!user.pendingEmail) {
    throw new Error('Pending email not found');
  }

  const oldEmail = user.email;
  const newEmail = user.pendingEmail;

  user.email = newEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;
  user.emailChangeTokenExpires = null;

  await user.save();

  return {
    oldEmail,
    newEmail,
    user,
  };
};

export const userService = {
  normalize,
  getByEmail,
  getById,
  create,
  activate,
  getAllActive,
  updateResetToken,
  getByResetToken,
  createNewPassword,
  updateName,
  updatePassword,
  setPendingEmail,
  getByEmailChangeToken,
  confirmEmailChange,
};
