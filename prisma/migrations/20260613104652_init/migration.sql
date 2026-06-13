-- CreateTable
CREATE TABLE "change_email_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tokenHash" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "change_email_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "change_email_tokens_tokenHash_key" ON "change_email_tokens"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "change_email_tokens_newEmail_key" ON "change_email_tokens"("newEmail");

-- AddForeignKey
ALTER TABLE "change_email_tokens" ADD CONSTRAINT "change_email_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
