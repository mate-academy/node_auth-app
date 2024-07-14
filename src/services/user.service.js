import { User } from "../models/user.js";

// function getAllActivated() {
//   return User.findAll({
//     where: {
//       activationToken: null
//     }
//   })
// }

async function getUser(id) {
  return await User.findOne({ where: { id } })
}

function normalize({ id, email }) {
  return { id, email }
}

function findByEmail(email) {
  return User.findOne({ where: { email } })
}

export const userService = {
  // getAllActivated,
  normalize,
  findByEmail,
  getUser,
}
