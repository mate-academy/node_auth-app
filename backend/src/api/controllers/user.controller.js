import { User } from "../../models/user.js"
import { userServices } from "../../services/user.service.js"

const getAllActivated = async (req, res) => {
  const users = await userServices.getAllActivated();

  res.send(
    users.map(userServices.normalize)
  )
}

export const userController = {
  getAllActivated
}
