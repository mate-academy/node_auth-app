import { EmailChanges } from '../models/emailChanges.model.js';

const create = async ({ userId, oldEmail, newEmail, confirmNewEmailToken }) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

  await EmailChanges.create({
    userId,
    oldEmail,
    newEmail,
    confirmNewEmailToken,
    expiresAt,
  });
};

const getByConfirmNewEmailToken = (confirmNewEmailToken) => {
  return EmailChanges.findOne({ where: { confirmNewEmailToken } });
};

export const emailChangesService = {
  create,
  getByConfirmNewEmailToken,
};
