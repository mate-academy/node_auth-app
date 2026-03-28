-- CreateTable
CREATE TABLE "users_auth" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "activationToken" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_auth" (
    "id" SERIAL NOT NULL,
    "refreshToken" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "tokens_auth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_email_key" ON "users_auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_activationToken_key" ON "users_auth"("activationToken");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_auth_refreshToken_key" ON "tokens_auth"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_auth_userId_key" ON "tokens_auth"("userId");

-- AddForeignKey
ALTER TABLE "tokens_auth" ADD CONSTRAINT "tokens_auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users_auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
