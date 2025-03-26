import { EmailChangeRequest } from '../models/EmailChangeRequest.model.js';

const updateOrCreate = async ({ userId, token, expiresAt, email }) => {
  const existEmailChangeRequest = await EmailChangeRequest.findOne({
    where: { userId },
  });

  if (existEmailChangeRequest) {
    existEmailChangeRequest.token = token;
    existEmailChangeRequest.expiresAt = expiresAt;
    existEmailChangeRequest.email = email;

    await existEmailChangeRequest.save();

    return existEmailChangeRequest;
  }

  return EmailChangeRequest.create({
    userId,
    email,
    token,
    expiresAt,
  });
};

const getByToken = async (token) => {
  return EmailChangeRequest.findOne({
    where: { token },
  });
};

const getByUserId = async (userId) => {
  return EmailChangeRequest.findOne({ where: { userId } });
};

const deleteByUserId = async (userId) => {
  await EmailChangeRequest.destroy({ where: { userId } });
};

const EmailChangeRepository = {
  updateOrCreate: updateOrCreate,
  getByToken,
  getByUserId,
  deleteByUserId,
};

export default EmailChangeRepository;
