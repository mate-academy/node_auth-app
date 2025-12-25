import crypto from "crypto";
import { Op } from "sequelize";
import { ResetToken } from "../models/resetToken.js";
import { User } from "../models/user.js";
import { emailService } from "./email.service.js";
import { ApiError } from "../exceptions/api.error.js";
import bcrypt from "bcrypt";

const TOKEN_TTL = 60 * 60 * 1000;

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

async function sendResetEmail(email) {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return;
  }

  const plainToken = generateToken();
  const tokenHash = hashToken(plainToken);

  await ResetToken.create({
    userId: user.id,
    resetToken: tokenHash,
    expiresAt: new Date(Date.now() + TOKEN_TTL),
    used: false,
  });

  await emailService.sendConfirmationEmail(user.email, plainToken);
}


async function validateResetToken(token) {
  const tokenHash = hashToken(token);

  const resetToken = await ResetToken.findOne({
    where: {
      resetToken: tokenHash,
      used: false,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
    include: User,
  });

  if (!resetToken) {
    throw ApiError.badRequest('Token is invalid or expired');
  }

  return resetToken;
}

async function resetPassword(token, newPassword) {
  const resetToken = await validateResetToken(token);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await resetToken.user.update({
    password: hashedPassword,
  });

  resetToken.used = true;
  await resetToken.save();
}


export const passwordResetServices = {
  sendResetEmail,
  resetPassword
}
