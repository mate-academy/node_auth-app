import { db } from '../utils/db.js';

const normalize = ({ id, email, name }) => {
  return { id, email, name };
};

const getAllActivatedUsers = () => {
  return db.user.findMany({
    where: {
      activationToken: null,
    },
  });
};

const findByEmail = (email) => {
  const user = db.user.findFirst({
    where: {
      email,
    },
  });

  return user;
};

const changeData = (data) => {
  const updatedUser = db.user.update({
    where: {
      id: data.id,
    },
    data: {
      ...data,
    },
  });

  return updatedUser;
};

const changePassword = (id, newPassword) => {
  const user = db.user.update({
    where: { id },
    data: { password: newPassword },
  });

  return user;
};

const changeEmail = (id, newEmail) => {
  const user = db.user.update({
    where: { id },
    data: { email: newEmail },
  });

  return user;
};

export const userService = {
  normalize,
  getAllActivatedUsers,
  findByEmail,
  changeData,
  changePassword,
  changeEmail,
};
