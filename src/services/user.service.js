import { db } from '../utils/db.js';

const normalize = ({ id, email }) => {
  return { id, email };
}

const getAllActivatedUsers = () => {
  return db.user.findMany({
    where: {
      activationToken: null,
    }
  })
}

const findByEmail = (email) => {
  const user = db.user.findFirst({
    where: {
      email,
    }
  })

  return user
}

export const userService = {
  normalize,
  getAllActivatedUsers,
  findByEmail
}