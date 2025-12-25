import { ApiError } from "../../exceptions/api.error.js";
import { passwordResetServices } from "../../services/passwordReset.service.js";
import { userServices } from "../../services/user.service.js";

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) return "Email is required";
  if (!EMAIL_PATTERN.test(value)) return "Email is not valid";
}

function validatePassword(value) {
  if (!value) return "Password is required";
  if (value.length < 6) return "At least 6 characters";
};

const sendPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await userServices.findByEmail(email);

  const errors = {
    email: validateEmail(email),
  }

  if (errors.email) {
    throw ApiError.badRequest('Bad request', errors);
  }

  if (!user) {
    return res.status(200).send({
      message: 'If user exists, we sent email'
    })
  }

  await passwordResetServices.sendResetEmail(email);

  res.sendStatus(200);
}

const confirmPasswordReset = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  const errors = {
    password: validatePassword(password),
    confirmPassword: validatePassword(confirmPassword),
  }

  if (errors.password || errors.confirmPassword) {
    throw ApiError.badRequest('Bad request', errors);
  }

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match', {
      confirmPassword: 'Passwords do not match',
    });
  }

  await passwordResetServices.resetPassword(token, password);

  res.send({ message: 'Password successfully changed' });
}

export const passwordResetController = {
  sendPasswordReset,
  confirmPasswordReset,
}
