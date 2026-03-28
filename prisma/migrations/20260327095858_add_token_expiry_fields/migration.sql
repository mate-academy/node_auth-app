-- AlterTable
ALTER TABLE "users_auth" ADD COLUMN     "activationExpiresAt" TIMESTAMPTZ(6),
ADD COLUMN     "passwordResetExpiresAt" TIMESTAMPTZ(6),
ADD COLUMN     "pendingEmailExpiresAt" TIMESTAMPTZ(6);
