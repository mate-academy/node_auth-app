// import { userService } from "../services/user.service.js"

import { jwtService } from "../services/jwt.service.js";

// const allUserActivated = async (req, res) => {
//   try {
//     const users = await userService.getAllActivated();

//     res.send(users.map(userService.normalize))
//   } catch (err) {
//     res.status(500).send(err)
//   }
// }

// export const userController = {
//   allUserActivated
// }

const user = async (req, res) => {
  const { id } = req.params;
  const user = userService.getUser(id)

  res.send(`Hello ${user.name}`)
}

export const userController = {
  user,
}

