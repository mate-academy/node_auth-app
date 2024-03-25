import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service.js';
import { validationService } from '../services/validation.service.js';

const get = async (req, res) => {
  const { id } = req.params;
  const user = await userService.getById(+id);
  const unauthorized = await validationService.isAuthorized(+id);

  if (unauthorized) {
    return res.send(unauthorized);
  }

  const html = `
    <h1>Profile of ${user.name}</h1>
  `;

  res.send(html);
};

const updateUsernamePage = async (req, res) => {
  const { id } = req.params;
  const user = await userService.getById(+id);

  const html = `
    <h1>${user.name} please enter a new user name</h1>
  `;

  res.send(html);
};

const updateUsernamePost = async (req, res) => {
  const { id } = req.params;
  const { newUserName } = req.body;
  const unauthorized = await validationService.isAuthorized(+id);

  if (unauthorized) {
    return res.send(unauthorized);
  }

  await userService.updateUsername(+id, newUserName);

  const html = `
    <h1>${newUserName}, your username has been successfully updated!</h1>
  `;

  res.send(html);
};

const updatePasswordPage = async (req, res) => {
  const { id } = req.params;
  const user = await userService.getById(+id);

  const unauthorized = await validationService.isAuthorized(id);

  if (unauthorized) {
    return res.send(unauthorized);
  }

  const html = `
    <h1>Password update page</h1>
    <h2>${user.name} please enter a new password and confirm it</h2>
  `;

  res.send(html);
};

const updatePasswordPost = async (req, res) => {
  const { id } = req.params;
  const unauthorized = await validationService.isAuthorized(id);

  if (unauthorized) {
    return res.send(unauthorized);
  }

  const { newPassword, confirmationPassword } = req.body;
  const user = await userService.getById(+id);

  const invalidUpdatePassword = await validationService.updatePassword(
    user,
    newPassword,
    confirmationPassword,
  );

  if (invalidUpdatePassword) {
    return res.send(invalidUpdatePassword);
  }

  user.password = newPassword;
  user.save();

  const html = `
    <h1>${user.name} password has been succesfully changed!</h1>
  `;

  res.send(html);
};

const updateEmailPasswordPage = async (req, res) => {
  const { id } = req.params;
  const unauthorized = await validationService.isAuthorized(id);

  if (unauthorized) {
    return res.send(unauthorized);
  }

  const html = `
    <h1>Please enter password to update an email</h1>
  `;

  res.send(html);
};

const updateEmailPasswordPost = async (req, res) => {
  const { id } = req.params;
  const unauthorized = await validationService.isAuthorized(+id);

  if (unauthorized) {
    return res.send(unauthorized);
  }

  const { password } = req.body;
  const user = await userService.getById(+id);

  const invalidPassword = await validationService.updateEmailPasswordPost(
    user,
    password,
  );

  if (invalidPassword) {
    return res.send(invalidPassword);
  }

  res.redirect(
    `http://localhost:${process.env.PORT}/updateEmail/emailPost/${id}`,
  );
};

const updateEmailEmailPage = async (req, res) => {
  const { id } = req.params;
  const unauthorized = await validationService.isAuthorized(id);

  if (unauthorized) {
    return res.send(unauthorized);
  }

  const html = `
    <h1>Please enter a new email</h1>
  `;

  res.send(html);
};

const updateEmailEmailPost = async (req, res) => {
  const { id } = req.params;

  const unauthorized = await validationService.isAuthorized(+id);

  if (unauthorized) {
    return res.send(unauthorized);
  }

  const user = await userService.getById(+id);
  const { email: newEmail } = req.body;

  const invalidEmail = await validationService.updateEmailEmailPost(
    newEmail,
    user,
  );

  if (invalidEmail) {
    return res.send(invalidEmail);
  }

  const oldEmail = user.email;

  user.email = newEmail;
  user.save();

  await emailService.sendNotification(oldEmail, newEmail);
  res.send('Your email has been succesfully updated!');
};

export const profileController = {
  get,
  updateUsernamePage,
  updateUsernamePost,
  updatePasswordPage,
  updatePasswordPost,
  updateEmailPasswordPage,
  updateEmailPasswordPost,
  updateEmailEmailPage,
  updateEmailEmailPost,
};
