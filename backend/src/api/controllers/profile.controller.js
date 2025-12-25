import { ApiError } from "../../exceptions/api.error.js";
import { userServices } from "../../services/user.service.js";

function validateName(value) {
  const name = value.trim();
  const NAME_PATTERN = /^[\p{L}\s'-]{2,30}$/u;

  if (!name) {
    return "Name is required";
  }

  if (!NAME_PATTERN.test(name)) {
    return "Name is not valid";
  }
}

function validatePassword(value) {
  if (!value) return "Password is required";
  if (value.length < 6) return "At least 6 characters";
};

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) return "Email is required";
  if (!EMAIL_PATTERN.test(value)) return "Email is not valid";
}

const changeName = async (req, res) => {
  const { name } = req.body;
  const errors = {
    name: validateName(name),
  };

  if (!req.user?.id) {
    throw ApiError.unathorized('User is unathorized');
  }

  if (errors.name) {
    throw ApiError.badRequest('Invalid name', {
      confirmEmail: 'Invalid name',
    });
  }

  const updatedUser = await userServices.updateName(req.user.id, name);
  res.status(200).send(updatedUser);
}

const changePassword = async (req, res) => {
  if (!req.user?.id) {
    throw ApiError.unathorized();
  }

  const { oldPassword, newPassword, confirmPassword } = req.body;
  const errors = {
    oldPassword: validatePassword(oldPassword),
    newPassword: validatePassword(newPassword),
    confirmPassword: validatePassword(confirmPassword),
  }

  if (errors.oldPassword || errors.newPassword || errors.confirmPassword) {
    throw ApiError.badRequest('Bad request', errors)
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match', {
      confirmPassword: 'Passwords do not match',
    });
  }

  await userServices.changePassword(req.user.id, oldPassword, newPassword);

  return res.send({ message: 'Password changed successfully' });
}

const changeEmail = async (req, res) => {
  if (!req.user?.id) {
    throw ApiError.unathorized();
  }

  const { password, newEmail, confirmEmail } = req.body;
  const errors = {
    password: validatePassword(password),
    newEmail: validateEmail(newEmail),
    confirmEmail: validateEmail(confirmEmail),
  }

  if (errors.password || errors.newEmail || errors.confirmEmail) {
    throw ApiError.badRequest('Bad request', errors);
  }

  if (newEmail !== confirmEmail) {
    throw ApiError.badRequest('Emails do not match', {
      confirmEmail: 'Emails do not match',
    });
  }

  await userServices.changeEmail(req.user.id, newEmail, password);

  res.status(200).send({
    message: 'Email changed successfully'
  });
}

export const profileControllers = {
  changeName,
  changePassword,
  changeEmail
}
