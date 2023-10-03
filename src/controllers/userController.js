import { userService } from '../services/userService.js';

async function getAllActivated(req, res) {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

async function updateName(req, res, next) {
  try {
    const { email, fullName } = req.body;

    await userService.updateName(email, fullName);

    res.status(200).send({ message: 'OK' });
  } catch (error) {
    res.status(500).send({ message: 'FAILED' });
  }
}

async function updateEmail(req, res, next) {
  try {
    const { oldEmail, newEmail } = req.body;

    const updatedUser = await userService.updateEmail(oldEmail, newEmail);

    if (updatedUser) {
      res.status(200).send({
        user: updatedUser,
        message: 'OK',
      });
    } else {
      res.status(404).send({ message: 'FAILED' });
    }
  } catch (error) {
    res.status(500).send({ message: 'FAILED' });
  }
}

export const userController = {
  getAllActivated,
  updateName,
  updateEmail,
};
