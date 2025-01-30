import { Session } from '../models/session.model.js';
import { ApiError } from '../exceptions/api.error.js';

const findByUserId = async (userId) => {
  return Session.findOne({
    where: {
      userId,
    },
  });
};

const updateTokenVersion = async (userId) => {
  const sessionToUpdate = await findByUserId(userId);

  if (!sessionToUpdate) {
    throw ApiError.badRequest('Cannot find a session for passed userId');
  }

  sessionToUpdate.tokenVersion += 1;
  await sessionToUpdate.save();

  // console.log('Session data successfully updated');
};

const initializeSession = async (userId) => {
  await Session.create({
    userId,
    tokenVersion: 1,
  });
};

const normalizeSession = async ({ id, tokenVersion, userId }) => {
  return { id, tokenVersion, userId };
};

export const sessionService = {
  updateTokenVersion,
  findByUserId,
  initializeSession,
  normalizeSession,
};
