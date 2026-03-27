import { db } from '../utils/db.js';

const getByProviderAndId = async (provider, providerId) => {
  return db.socialAccount.findUnique({
    where: { provider_providerId: { provider, providerId } },
  });
};

const getByUserId = async (userId) => {
  return db.socialAccount.findMany({ where: { userId } });
};

const create = async (userId, provider, providerId) => {
  return db.socialAccount.create({
    data: { userId, provider, providerId },
  });
};

const remove = async (id) => {
  return db.socialAccount.delete({ where: { id } });
};

export const socialAccountService = {
  getByProviderAndId,
  getByUserId,
  create,
  remove,
};
