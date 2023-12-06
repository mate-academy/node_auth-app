'use strict';
import { usersService } from "../services/users.service.js";
import { v4 as uuid4 } from "uuid";
import bcrypt from 'bcrypt';
import passport from "passport";
import { sendEmail, sendNotificationOfEmailChange } from "../utils/sendEmail.js";
import { validate } from "../utils/validate.js";

/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

const createUser = async(req, res) => {
  const {
    name,
    password,
    email,
} = req.body;

console.log(req.body);

  if (
    !validate.name(name)
    || !validate.password(password)
    || !validate.email(email)
  ) {
    res.status(400);
    res.send({message: 'Fill empty field'});

    return;
  }

  try {
    const checkExistingUser = await usersService.getUserByEmail(email);

    if (checkExistingUser) {
      res.status(400);
      res.send({message: 'User with given email already Exist!'});

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const createdUser = await usersService.createUser({
      name,
      password: hashedPassword,
      email,
      secretToken: uuid4(),
    });

    await sendEmail({
      email,
      title: `Verify Email`,
      token: createdUser.secretToken,
      type: 'verify-email',
    });

    res.send(createdUser);
  } catch (err) {
    console.error('Error executing query:', err);

    res.status(500).send(err.message);
  }
};

const logIn = (req, res) => {
  res.status(200).send(
    usersService.normalizeUserData(req.user)
    );
}

const getAuthUser = (req, res) => {
  res.status(200).send(
    usersService.normalizeUserData(req.user)
    );
}

const logOut = (req, res) => {
	req.session.destroy(function () {
		res.clearCookie("connect.sid");
		res.send({ success: true });
	});
}

const verify = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    res.sendStatus(404);

    return;
  }

  const user = await usersService.getUserBySecretToken(token);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.set({
    secretToken: null,
    verified: true,
  });

  await user.save();

  res.send(usersService.normalizeUserData(user));
}

const resetPassword = async(req, res) => {
  const { email } = req.body;

  if (!email) {
    res.sendStatus(400);

    return;
  }

  try {
    const user = await usersService.getUserByEmail(email);
    console.log('user: ' , user);

    if (!user) {
      res.status(404).send({ message: "No user found with this email address" });

      return;
    }

    const token = uuid4();

    user.secretToken = token;

    await user.save();

    await sendEmail({
      email,
      title: `Reset Password`,
      token,
      type: 'set-new-password',
    });

    res.status(200).send({ message: "OK" });
  } catch (err) {
    console.error('Error executing query:', err);

    res.status(500).send(err.message);
  }
}

const resendEmail = async(req, res) => {
  const email = req.user.email;

  try {
    const user = await usersService.getUserByEmail(email);

    if (!user) {
      res.sendStatus(404);

      return;
    }

    const token = uuid4();

    user.secretToken = token;

    await user.save();

    await sendEmail({
      email,
      title: `Verify Email (retry)`,
      token,
      type: 'verify-email',
    });

    res.status(200).send({message: 'ok'})
  } catch (err) {
    console.error('Error executing query:', err);

    res.status(500).send(err.message);
  }
}

const updateEmailRequest = async(req, res) => {
  const currentEmail = req.user.email;
  const { email } = req.body;

  if (!validate.email(email)) {
    res.sendStatus(400);

    return;
  }

  try {
    const user = await usersService.getUserByEmail(currentEmail);

    if (!user) {
      res.sendStatus(404);

      return;
    }

    let token = uuid4();
    const tokenToSend= token + `&email=${email}`

    user.secretToken = token;

    await user.save();

    await Promise.all([
      sendEmail({
        email,
        title: `Email changing`,
        token: tokenToSend,
        type: 'verify-email',
      }),
      sendNotificationOfEmailChange({
        currentEmail,
        title: `Someone tried to set a new email to your account`,
        text: `
        Someone tried to set a new email to your account as ${email}
        `,
      }),
    ])

    res.status(200).send({ message: "Success" });
  } catch (err) {
    console.error('Error executing query:', err);

    res.status(500).send(err.message);
  }
}

const setNewPassword = async(req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !validate.password(newPassword)) {
    res.sendStatus(400);

    return;
  }

  const user = await usersService.getUserBySecretToken(token);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  user.set({
    secretToken: null,
    password: hashedPassword,
  });

  await user.save();

  res.status(200).send({ message: "Password has changed" });

}

const setNewEmail = async(req, res) => {
  const { token, email } = req.body;
  console.log(token, email);
  if (!token || !validate.email(email)) {
    res.sendStatus(400);

    return;
  }

  try {
    const user = await usersService.getUserBySecretToken(token);

    if (!user) {
      res.status(404).send({message: 'User not found'});

      return;
    }

    user.set({
      secretToken: null,
      email,
    });

    await sendNotificationOfEmailChange({
      currentEmail: email,
      title: `Email has changed`,
      text: `
      Email has changed to ${email}
      `,
    });

    await user.save();

    res.send(user);
  } catch (error) {
    res.status(404).send({message: error.message})
  }


}

const getAll = async(req, res) => {
  try {
    const result = await usersService.getAllUsers();

    res.send(result.map(user => usersService.normalizeUserData(user)));
  } catch (err) {
    console.error('Error executing query:', err);

    res.status(500).send(err.message);
  }
};

const getById = async(req, res) => {
  const { id } = req.params;

  if (!id) {
    res.sendStatus(400);

    return;
  }

  try {
    const result = await usersService.getUserById({id});

    if (!result) {
      res.sendStatus(404);

      return;
    }

    res.send(usersService.normalizeUserData(result));
  } catch (err) {
    console.error('Error executing query:', err);

    res.status(500).send(err.message);
  }
};

const deleteParticular = async(req, res) => {
  const { id } = req.params;

  if (!id) {
    res.sendStatus(400);

    return;
  }

  try {
    await usersService.deleteUserById(id);

    res.send(`one user with id ${id} was deleted`);
  } catch (err) {
    console.error('Error executing query:', err);

    res.status(500).send(err.message);
  }
};

const updateName = async(req, res) => {
  const id = req.user.id;
  const { name } = req.body;

  if (!validate.name(name)) {
    res.sendStatus(421);

    return;
  }

  try {
    await usersService.updateUserById({id, name});

    const updatedUser = await usersService.getUserById({id})
    console.log(updatedUser);

    if (!updatedUser) {
      res.status(404).send({ message: "No user found" });

      return;
    }

    res.send(updatedUser);
  } catch (err) {
    console.error('Error executing query:', err);

    res.status(500).send(err.message);
  }
};

const updatePassword = async(req, res) => {
  const  id  = req.user.id;
  const {
    oldPassword,
    newPassword,
    newConfirmedPassword,
} = req.body;

console.log(  id,  oldPassword,
  newPassword,
  newConfirmedPassword,);

  if (
    !oldPassword
    || !newPassword
    || (newPassword !== newConfirmedPassword)
    || !validate.password(newConfirmedPassword)
    ) {
    res.sendStatus(400);

    return;
  }

  try {
    const user = await usersService.getUserById({id});

    if (!bcrypt.compareSync(oldPassword, user.password)) {
      res.sendStatus(401);

      return;
    }

    const password = await bcrypt.hash(newPassword, 10)

    const updatedUser = await usersService.updateUserById({id, password});
    console.log(updatedUser);

    if (!updatedUser[0]) {
      res.status(404);
      res.send(updatedUser);

      return;
    }

    res.status(200).send({message: 'Password has updated'})
  } catch (err) {
    console.error('Error executing query:', err);

    res.status(500).send(err.message);
  }
};

export const usersController = {
  getAll,
  createUser,
  getById,
  deleteParticular,
  updateName,
  logIn,
  verify,
  setNewPassword,
  resetPassword,
  updatePassword,
  updateEmailRequest,
  setNewEmail,
  logOut,
  getAuthUser,
  resendEmail,
};
