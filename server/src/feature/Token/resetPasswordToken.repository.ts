import { ResetPasswordToken } from '../../models/PasswordResetToken.model.js';

function create(userId: number, token: string) {
  return ResetPasswordToken.create({ userId, token });
}

function getUnusedByUserId(userId: number) {
  return ResetPasswordToken.findOne({
    where: {
      userId,
      usedAt: null,
    },
  });
}

function deleteByUserId(userId: number) {
  return ResetPasswordToken.destroy({
    where: {
      userId,
    },
  });
}

function useToken(token: string) {
  return ResetPasswordToken.update({usedAt: Date.now()}, {
    where: {
      token,
    },
  });
}



export const resetPasswordTokenRepository = {
  create,
  deleteByUserId,
  getUnusedByUserId,
  useToken,
};
