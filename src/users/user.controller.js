const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { compareData, hashData } = require('../utils/hash');
const service = require('./user.service');
const emailService = require('../email/email.service');

const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.id;
  const { name, password, newPassword, email, confirmation } = req.body;

  if (parseInt(id) !== parseInt(userId)) {
    throw new AppError('You cannot update another user.', 403);
  }

  const user = await service.getById(+userId);

  if (!user) {
    throw new AppError('User no longer exists.', 404);
  }

  const dataToUpdate = {};

  if (name) {
    dataToUpdate.name = name;
  }

  if (password && newPassword) {
    const isValid = await compareData(password, user.password);

    if (!isValid) {
      throw new AppError('Incorrect old password.', 400);
    }

    if (newPassword !== confirmation) {
      throw new AppError('New password and confirmation do not match.', 400);
    }

    dataToUpdate.password = await hashData(newPassword);
  }

  if (email && password) {
    const isValid = await compareData(password, user.password);

    if (!isValid) {
      throw new AppError('Incorrect password for email change.', 400);
    }

    await emailService.sendEmail({
      to: user.email,
      subject: 'Email change notification',
      text: `Your email was changed to: ${email}`,
    });

    dataToUpdate.email = email;
  }

  if (Object.keys(dataToUpdate).length === 0) {
    throw new AppError('No valid update data provided.', 400);
  }

  const updatedUser = await service.update(id, dataToUpdate);

  res.status(200).json(service.normalize(updatedUser));
});

module.exports = {
  update,
};
