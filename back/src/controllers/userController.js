/* eslint-disable quotes */
import { userService } from "../services/userService.js";

async function getAll(req, res, next) {
  const users = await userService.getAllActive();

  res.send(users.map(userService.normalize));
}

async function updateName(req, res, next) {
  try {
    const { email, fullName } = req.body;

    await userService.updateName(email, fullName);

    res.send({ status: "OK" });
  } catch (error) {
    res.send({ status: "FAILED" });
  }
}

async function updateEmail(req, res, next) {
  try {
    const { oldEmail, newEmail } = req.body;

    const updatedUser = await userService.updateEmail(oldEmail, newEmail);

    if (updatedUser) {
      res.send({
        user: updatedUser,
        status: "OK",
      });
    } else {
      res.send({ status: "FAILED" });
    }
  } catch (error) {
    res.send({ status: "FAILED" });
  }
}

export const userController = {
  getAll,
  updateName,
  updateEmail,
};
