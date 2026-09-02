import {
  getMe,
  updateName,
  changePassword,
  changeEmail,
  confirmEmailChange,
} from '../services/users.service.js';

export async function getMeController(req, res) {
  const user = await getMe(req.userId);

  res.json(user);
}

export async function updateNameController(req, res) {
  const user = await updateName(req.userId, req.body.name);

  res.json(user);
}

export async function changePasswordController(req, res) {
  await changePassword(req.userId, req.body);
  res.status(200).json({});
}

export async function changeEmailController(req, res) {
  await changeEmail(req.userId, req.body);
  res.status(200).json({});
}

export async function confirmEmailChangeController(req, res) {
  const { token } = req.params;

  await confirmEmailChange(token);

  res.type('html').send(`
    <!doctype html>
    <html>
      <body><p>Your email has been updated. You can close this tab and log in again.</p></body>
    </html>
  `);
}
