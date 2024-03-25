import { userService } from '../services/user.service.js';
import { validationService } from '../services/validation.service.js';

const resetQuerryGet = async (req, res) => {
  const html = `
    <h1>Please enter your email to reset the password</h1>
  `;

  res.send(html);
};

const resetQuerryPost = async (req, res) => {
  const { email } = req.body;
  const resetInvalid = await validationService.reset(email);

  if (resetInvalid) {
    return res.send(resetInvalid);
  }

  const user = await userService.getByEmail(email);

  res.redirect(`http://localhost:${process.env.PORT}/resetPassword/${user.id}`);
};

const resetActionGet = async (req, res) => {
  const { id } = req.params;
  const user = await userService.getById(+id);

  const html = `
    <h1>${user.name}Please enter new password and confirm it</h1>
  `;

  res.send(html);
};

const resetActionPost = async (req, res) => {
  const { newPassword, confirmationPassword } = req.body;
  const { id } = req.params;
  const user = await userService.getById(id);

  const invalidResetPassword = validationService.resetPassword(
    user,
    newPassword,
    confirmationPassword,
  );

  if (invalidResetPassword) {
    return res.send(invalidResetPassword);
  }

  user.password = newPassword;
  user.save();

  const html = `
    <h1>Password has been succesfully changed!</h1>
    <a href=${`http://localhost:${process.env.PORT}/login`}>Login page</a>
  `;

  res.send(html);
};

export const resetController = {
  resetQuerryGet,
  resetQuerryPost,
  resetActionGet,
  resetActionPost,
};
