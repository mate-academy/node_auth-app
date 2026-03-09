import {
  getUserProfile,
  updateName,
  updatePassword,
  requestEmailChange,
  confirmEmailChange,
} from '../services/profile.service.js';

export async function getProfile(req, res, next) {
  try {
    const user = await getUserProfile(req.user.id);

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function changeName(req, res, next) {
  try {
    const user = await updateName(req.user.id, req.body.name);

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const result = await updatePassword(
      req.user.id,
      oldPassword,
      newPassword,
      confirmPassword,
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function changeEmail(req, res, next) {
  try {
    const { password, newEmail } = req.body;

    const result = await requestEmailChange(req.user.id, password, newEmail);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function confirmNewEmail(req, res, next) {
  try {
    const { token } = req.params;

    const result = await confirmEmailChange(token);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
