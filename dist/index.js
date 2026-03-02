// src/createServer.ts
import "dotenv/config";
import express from "express";
import cors from "cors";

// src/routes/users.routes.ts
import { Router } from "express";

// src/db.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import "process";
import * as path from "path";
import { fileURLToPath } from "url";
import "@prisma/client/runtime/client";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.4.1",
  "engineVersion": "55ae170b1ced7fc6ed07a15f110549408c501bb3",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id              String         @id @default(dbgenerated("gen_random_uuid()"))\n  email           String         @unique\n  name            String\n  password        String\n  passwordToken   String?\n  activationToken String?        @default(dbgenerated("gen_random_uuid()"))\n  refreshTokens   RefreshToken[]\n\n  @@map("users")\n}\n\nmodel RefreshToken {\n  id        String   @id @default(dbgenerated("gen_random_uuid()"))\n  userId    String   @unique\n  user      User     @relation(fields: [userId], references: [id])\n  token     String   @unique\n  createdAt DateTime @default(now())\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"passwordToken","kind":"scalar","type":"String"},{"name":"activationToken","kind":"scalar","type":"String"},{"name":"refreshTokens","kind":"object","type":"RefreshToken","relationName":"RefreshTokenToUser"}],"dbName":"users"},"RefreshToken":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"RefreshTokenToUser"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","refreshTokens","_count","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","RefreshToken.findUnique","RefreshToken.findUniqueOrThrow","RefreshToken.findFirst","RefreshToken.findFirstOrThrow","RefreshToken.findMany","RefreshToken.createOne","RefreshToken.createMany","RefreshToken.createManyAndReturn","RefreshToken.updateOne","RefreshToken.updateMany","RefreshToken.updateManyAndReturn","RefreshToken.upsertOne","RefreshToken.deleteOne","RefreshToken.deleteMany","RefreshToken.groupBy","RefreshToken.aggregate","AND","OR","NOT","id","userId","token","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","email","name","password","passwordToken","activationToken","every","some","none","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany"]'),
  graph: "ahIgCgQAAEUAICwAAEIAMC0AAAkAEC4AAEIAMC8BAAAAAT4BAAAAAT8BAEMAIUABAEMAIUEBAEQAIUIBAEQAIQEAAAABACAIAwAASAAgLAAARgAwLQAAAwAQLgAARgAwLwEAQwAhMAEAQwAhMQEAQwAhMkAARwAhAQMAAGQAIAgDAABIACAsAABGADAtAAADABAuAABGADAvAQAAAAEwAQAAAAExAQAAAAEyQABHACEDAAAAAwAgAQAABAAwAgAABQAgAQAAAAMAIAEAAAABACAKBAAARQAgLAAAQgAwLQAACQAQLgAAQgAwLwEAQwAhPgEAQwAhPwEAQwAhQAEAQwAhQQEARAAhQgEARAAhAwQAAGMAIEEAAFAAIEIAAFAAIAMAAAAJACABAAAKADACAAABACADAAAACQAgAQAACgAwAgAAAQAgAwAAAAkAIAEAAAoAMAIAAAEAIAcEAABiACAvAQAAAAE-AQAAAAE_AQAAAAFAAQAAAAFBAQAAAAFCAQAAAAEBCwAADgAgBi8BAAAAAT4BAAAAAT8BAAAAAUABAAAAAUEBAAAAAUIBAAAAAQELAAAQADABCwAAEAAwBwQAAFUAIC8BAEwAIT4BAEwAIT8BAEwAIUABAEwAIUEBAFQAIUIBAFQAIQIAAAABACALAAATACAGLwEATAAhPgEATAAhPwEATAAhQAEATAAhQQEAVAAhQgEAVAAhAgAAAAkAIAsAABUAIAIAAAAJACALAAAVACADAAAAAQAgEgAADgAgEwAAEwAgAQAAAAEAIAEAAAAJACAFBQAAUQAgGAAAUwAgGQAAUgAgQQAAUAAgQgAAUAAgCSwAAD0AMC0AABwAEC4AAD0AMC8BADYAIT4BADYAIT8BADYAIUABADYAIUEBAD4AIUIBAD4AIQMAAAAJACABAAAbADAXAAAcACADAAAACQAgAQAACgAwAgAAAQAgAQAAAAUAIAEAAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACAFAwAATwAgLwEAAAABMAEAAAABMQEAAAABMkAAAAABAQsAACQAIAQvAQAAAAEwAQAAAAExAQAAAAEyQAAAAAEBCwAAJgAwAQsAACYAMAUDAABOACAvAQBMACEwAQBMACExAQBMACEyQABNACECAAAABQAgCwAAKQAgBC8BAEwAITABAEwAITEBAEwAITJAAE0AIQIAAAADACALAAArACACAAAAAwAgCwAAKwAgAwAAAAUAIBIAACQAIBMAACkAIAEAAAAFACABAAAAAwAgAwUAAEkAIBgAAEsAIBkAAEoAIAcsAAA1ADAtAAAyABAuAAA1ADAvAQA2ACEwAQA2ACExAQA2ACEyQAA3ACEDAAAAAwAgAQAAMQAwFwAAMgAgAwAAAAMAIAEAAAQAMAIAAAUAIAcsAAA1ADAtAAAyABAuAAA1ADAvAQA2ACEwAQA2ACExAQA2ACEyQAA3ACEOBQAAOQAgGAAAPAAgGQAAPAAgMwEAAAABNAEAAAAENQEAAAAENgEAAAABNwEAAAABOAEAAAABOQEAAAABOgEAOwAhOwEAAAABPAEAAAABPQEAAAABCwUAADkAIBgAADoAIBkAADoAIDNAAAAAATRAAAAABDVAAAAABDZAAAAAATdAAAAAAThAAAAAATlAAAAAATpAADgAIQsFAAA5ACAYAAA6ACAZAAA6ACAzQAAAAAE0QAAAAAQ1QAAAAAQ2QAAAAAE3QAAAAAE4QAAAAAE5QAAAAAE6QAA4ACEIMwIAAAABNAIAAAAENQIAAAAENgIAAAABNwIAAAABOAIAAAABOQIAAAABOgIAOQAhCDNAAAAAATRAAAAABDVAAAAABDZAAAAAATdAAAAAAThAAAAAATlAAAAAATpAADoAIQ4FAAA5ACAYAAA8ACAZAAA8ACAzAQAAAAE0AQAAAAQ1AQAAAAQ2AQAAAAE3AQAAAAE4AQAAAAE5AQAAAAE6AQA7ACE7AQAAAAE8AQAAAAE9AQAAAAELMwEAAAABNAEAAAAENQEAAAAENgEAAAABNwEAAAABOAEAAAABOQEAAAABOgEAPAAhOwEAAAABPAEAAAABPQEAAAABCSwAAD0AMC0AABwAEC4AAD0AMC8BADYAIT4BADYAIT8BADYAIUABADYAIUEBAD4AIUIBAD4AIQ4FAABAACAYAABBACAZAABBACAzAQAAAAE0AQAAAAU1AQAAAAU2AQAAAAE3AQAAAAE4AQAAAAE5AQAAAAE6AQA_ACE7AQAAAAE8AQAAAAE9AQAAAAEOBQAAQAAgGAAAQQAgGQAAQQAgMwEAAAABNAEAAAAFNQEAAAAFNgEAAAABNwEAAAABOAEAAAABOQEAAAABOgEAPwAhOwEAAAABPAEAAAABPQEAAAABCDMCAAAAATQCAAAABTUCAAAABTYCAAAAATcCAAAAATgCAAAAATkCAAAAAToCAEAAIQszAQAAAAE0AQAAAAU1AQAAAAU2AQAAAAE3AQAAAAE4AQAAAAE5AQAAAAE6AQBBACE7AQAAAAE8AQAAAAE9AQAAAAEKBAAARQAgLAAAQgAwLQAACQAQLgAAQgAwLwEAQwAhPgEAQwAhPwEAQwAhQAEAQwAhQQEARAAhQgEARAAhCzMBAAAAATQBAAAABDUBAAAABDYBAAAAATcBAAAAATgBAAAAATkBAAAAAToBADwAITsBAAAAATwBAAAAAT0BAAAAAQszAQAAAAE0AQAAAAU1AQAAAAU2AQAAAAE3AQAAAAE4AQAAAAE5AQAAAAE6AQBBACE7AQAAAAE8AQAAAAE9AQAAAAEDQwAAAwAgRAAAAwAgRQAAAwAgCAMAAEgAICwAAEYAMC0AAAMAEC4AAEYAMC8BAEMAITABAEMAITEBAEMAITJAAEcAIQgzQAAAAAE0QAAAAAQ1QAAAAAQ2QAAAAAE3QAAAAAE4QAAAAAE5QAAAAAE6QAA6ACEMBAAARQAgLAAAQgAwLQAACQAQLgAAQgAwLwEAQwAhPgEAQwAhPwEAQwAhQAEAQwAhQQEARAAhQgEARAAhRgAACQAgRwAACQAgAAAAAUsBAAAAAQFLQAAAAAEFEgAAZgAgEwAAaQAgSAAAZwAgSQAAaAAgTgAAAQAgAxIAAGYAIEgAAGcAIE4AAAEAIAAAAAABSwEAAAABCxIAAFYAMBMAAFsAMEgAAFcAMEkAAFgAMEoAAFkAIEsAAFoAMEwAAFoAME0AAFoAME4AAFoAME8AAFwAMFAAAF0AMAMvAQAAAAExAQAAAAEyQAAAAAECAAAABQAgEgAAYQAgAwAAAAUAIBIAAGEAIBMAAGAAIAELAABlADAIAwAASAAgLAAARgAwLQAAAwAQLgAARgAwLwEAAAABMAEAAAABMQEAAAABMkAARwAhAgAAAAUAIAsAAGAAIAIAAABeACALAABfACAHLAAAXQAwLQAAXgAQLgAAXQAwLwEAQwAhMAEAQwAhMQEAQwAhMkAARwAhBywAAF0AMC0AAF4AEC4AAF0AMC8BAEMAITABAEMAITEBAEMAITJAAEcAIQMvAQBMACExAQBMACEyQABNACEDLwEATAAhMQEATAAhMkAATQAhAy8BAAAAATEBAAAAATJAAAAAAQQSAABWADBIAABXADBKAABZACBOAABaADAAAwQAAGMAIEEAAFAAIEIAAFAAIAMvAQAAAAExAQAAAAEyQAAAAAEGLwEAAAABPgEAAAABPwEAAAABQAEAAAABQQEAAAABQgEAAAABAgAAAAEAIBIAAGYAIAMAAAAJACASAABmACATAABqACAIAAAACQAgCwAAagAgLwEATAAhPgEATAAhPwEATAAhQAEATAAhQQEAVAAhQgEAVAAhBi8BAEwAIT4BAEwAIT8BAEwAIUABAEwAIUEBAFQAIUIBAFQAIQIEBgIFAAMBAwABAQQHAAAAAAMFAAgYAAkZAAoAAAADBQAIGAAJGQAKAQMAAQEDAAEDBQAPGAAQGQARAAAAAwUADxgAEBkAEQYCAQcIAQgLAQkMAQoNAQwPAQ0RBA4SBQ8UARAWBBEXBhQYARUZARYaBBodBxseCxwfAh0gAh4hAh8iAiAjAiElAiInBCMoDCQqAiUsBCYtDScuAigvAikwBCozDis0Eg"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/db.ts
console.log(process.env);
var connectionString = `${process.env.DATABASE_URL || ""}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/repository/users.repository.ts
var normalize = ({ id, name, email }) => {
  return {
    id,
    name,
    email
  };
};
var create = async ({ name, email, password }) => {
  return prisma.user.create({
    data: {
      name,
      email,
      password
    }
  });
};
var getByEmail = async (email) => {
  return prisma.user.findFirst({
    where: {
      email
    }
  });
};
var getById = async (id) => {
  return prisma.user.findFirst({
    where: {
      id
    }
  });
};
var deleteActivationToken = async (id) => {
  return prisma.user.update({
    where: {
      id
    },
    data: { activationToken: null }
  });
};
var change = async (userId, toChange) => {
  return prisma.user.update({
    where: {
      id: userId
    },
    data: toChange
  });
};
var updatePasswordToken = async (id, passwordToken) => {
  return prisma.user.update({
    where: {
      id
    },
    data: {
      passwordToken
    }
  });
};

// src/service/mailer.service.ts
import "dotenv/config";
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  // Use true for port 465, false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
var sendMail = async (to, html, subject = "Activate your account") => {
  return transporter.sendMail({
    to,
    subject,
    html
  });
};

// src/service/jws.service.ts
import "dotenv/config";
import pkg from "jsonwebtoken";
var { sign, verify } = pkg;
var accessSecret = process.env.ACCESS_SECRET;
var refreshSecret = process.env.REFRESH_SECRET;
function wrap(callback) {
  try {
    return callback();
  } catch (err) {
    return null;
  }
}
var generateAccessToken = (normalizedUser) => {
  return wrap(() => sign(
    normalizedUser,
    accessSecret,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "5s" }
  ));
};
var validateAccessToken = (token) => {
  return wrap(() => {
    return verify(token, accessSecret);
  });
};
var generateRefreshToken = (normalizedUser) => {
  return wrap(() => sign(
    normalizedUser,
    refreshSecret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d" }
  ));
};
var validateRefreshToken = (token) => {
  return wrap(() => verify(token, refreshSecret));
};

// src/types/index.ts
var ApiError = class _ApiError extends Error {
  status;
  errors;
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
  static badRequest(messages) {
    return new _ApiError(
      "Bad request",
      400,
      { errors: messages }
    );
  }
  static authError(messages) {
    return new _ApiError(
      "Unauthorized",
      401,
      { errors: messages }
    );
  }
  static accountAlreadyExist(messages) {
    return new _ApiError("Conflict", 409, { errors: messages });
  }
  static notFound(messages) {
    return new _ApiError("Not found", 404, { errors: messages });
  }
};

// src/repository/tokens.repository.ts
var upsert = (normalizedUser) => {
  return prisma.refreshToken.upsert({
    where: {
      userId: normalizedUser.id
    },
    update: {
      token: generateRefreshToken(normalizedUser)
    },
    create: {
      userId: normalizedUser.id,
      token: generateRefreshToken(normalizedUser)
    }
  });
};
var deleteToken = (token) => {
  return prisma.refreshToken.delete({
    where: {
      token
    }
  });
};

// src/controllers/users.controller.ts
import { v4 as uuidv4 } from "uuid";

// src/utils/validators.ts
function validateEmail(email) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
  if (!email) return "Email is required";
  if (!emailPattern.test(email)) return "Email is not valid";
}
function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 6) return "At least 6 characters";
}

// src/controllers/users.controller.ts
import * as bcrypt from "bcrypt";

// src/service/auth.service.ts
var saveAuthorization = async (res, normalizedUser) => {
  const refreshToken = await upsert(normalizedUser);
  res.cookie("refreshToken", refreshToken.token, {
    maxAge: 30 * 24 * 60 * 60 * 1e3,
    httpOnly: true,
    sameSite: "lax"
  });
};
var auth_service_default = {
  saveAuthorization
};

// src/controllers/users.controller.ts
var create2 = async (req, res) => {
  const { name, email, password } = req.body;
  let user = await getByEmail(email);
  const emailValidation = validateEmail(email) || null;
  const passValidation = validatePassword(password) || null;
  const errors = [emailValidation, passValidation].filter(
    (validation) => validation !== null
  ).map((err) => ({ message: err }));
  if (errors.length) {
    throw ApiError.badRequest(errors);
  }
  if (user?.activationToken) {
    throw ApiError.badRequest([{
      message: "User already registered, check your mailbox for activation email"
    }]);
  }
  if (user) {
    throw ApiError.badRequest([{
      message: "User has already been registered"
    }]);
  }
  if (name && !validateEmail(email) && !validatePassword(password) && !user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = await create({
      name,
      email,
      password: hashedPassword
    });
  }
  if (!user) {
    throw ApiError.badRequest(
      [{
        message: "Invalid sign-up data"
      }]
    );
  }
  const href = `${process.env.CLIENT_URL}/activate/${email}/${user?.activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href=${href}> Click to activate </a>
  `;
  await sendMail(email, html);
  res.statusCode = 200;
  res.send(normalize(user));
};
var activate = async (req, res) => {
  const { email, activationToken } = req.params;
  if (typeof email !== "string" || typeof activationToken !== "string") {
    throw ApiError.badRequest(
      [{
        message: "Invalid data"
      }]
    );
  }
  const user = await getByEmail(email);
  if (!user) {
    throw ApiError.badRequest(
      [{ message: "User not found" }]
    );
  }
  if (!user.activationToken) {
    throw ApiError.accountAlreadyExist([{
      message: "Account already activated"
    }]);
  }
  if (user.activationToken !== activationToken) {
    throw ApiError.badRequest([{
      message: "Invalid activation token"
    }]);
  }
  const normalizedUser = normalize(user);
  await auth_service_default.saveAuthorization(res, normalizedUser);
  await deleteActivationToken(user.id);
  res.statusCode = 200;
  res.send({
    user: normalizedUser,
    accessToken: generateAccessToken(normalizedUser)
  });
};
var login = async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string") {
    throw ApiError.badRequest([{
      message: "Invalid login data"
    }]);
  }
  const user = await getByEmail(email);
  if (!user) {
    throw ApiError.notFound([{
      message: "User not found"
    }]);
  }
  if (user.activationToken) {
    throw ApiError.authError([{
      message: "User isnt activated, check your mailbox for activation link"
    }]);
  }
  const compare2 = await bcrypt.compare(password, user?.password);
  if (!compare2) {
    throw ApiError.authError([{
      message: "Invalid password"
    }]);
  }
  const normalizedUser = normalize(user);
  await auth_service_default.saveAuthorization(res, normalizedUser);
  res.statusCode = 200;
  res.send({
    user: normalizedUser,
    accessToken: generateAccessToken(normalizedUser)
  });
};
var profile = async (req, res) => {
  const normalizedUser = req.normalizedUser;
  res.statusCode = 200;
  res.send(normalizedUser);
};
var logout = async (req, res) => {
  const refreshToken = req.cookies["refreshToken"];
  res.clearCookie("refreshToken");
  const deleted = await deleteToken(refreshToken);
  if (!deleted) {
    throw ApiError.notFound([{
      message: "Account not found"
    }]);
  }
  res.statusCode = 204;
};
var changeName = async (req, res) => {
  const { name } = req.body;
  const userToUpdate = req.normalizedUser || null;
  if (typeof name !== "string" || name.length < 2) {
    throw ApiError.badRequest([{
      message: "Invalid data for an update"
    }]);
  }
  const updatedUser = await change(userToUpdate?.id, { name });
  const normalizedUser = normalize(updatedUser);
  await auth_service_default.saveAuthorization(res, normalizedUser);
  res.statusCode = 200;
  res.send({
    user: normalizedUser,
    accessToken: generateAccessToken(normalizedUser)
  });
};
var changeSensetive = async (req, res) => {
  const loginData = req.body.loginData || null;
  const toChange = req.body.toChange || null;
  if (!loginData || !toChange) {
    throw ApiError.badRequest([{
      message: "Bad request"
    }]);
  }
  const user = await getById(req.normalizedUser?.id) || null;
  if (toChange?.email && await getByEmail(toChange?.email)) {
    throw ApiError.badRequest([{
      for: "email",
      message: "Email already registered"
    }]);
  }
  if (!user) {
    throw ApiError.notFound([{
      for: "email",
      message: "Account not found"
    }]);
  }
  const compare2 = await bcrypt.compare(loginData.password, user.password);
  if (!compare2) {
    throw ApiError.authError([{
      for: "currentPassword",
      message: "Invalid Password"
    }]);
  }
  const updatedToChange = { ...toChange };
  if (Object.keys(updatedToChange).includes("password")) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(updatedToChange.password, salt);
    updatedToChange.password = hashedPassword;
  }
  const updatedUser = await change(user.id, updatedToChange);
  if (!updatedUser) {
    throw new ApiError(
      "User not found",
      404,
      { errors: [{ message: "User not found" }] }
    );
  }
  ;
  if (toChange?.email) {
    const html = `
        <h1>Changes in your auth account</h1>
        <h3>Email changed to ${toChange?.email}</h3>
      `;
    sendMail(user.email, html, "Update");
  }
  const normalizedUser = normalize(updatedUser);
  await auth_service_default.saveAuthorization(res, normalizedUser);
  res.statusCode = 200;
  res.send({
    user: normalizedUser,
    accessToken: generateAccessToken(normalizedUser)
  });
};
var generatePasswordToken = async (req, res) => {
  const { email } = req.body;
  const user = await getByEmail(email);
  if (!user) {
    throw ApiError.notFound([{
      for: "email",
      message: "User not found"
    }]);
  }
  const passwordToken = uuidv4();
  const updatedUser = await updatePasswordToken(user.id, passwordToken);
  if (!updatedUser) {
    throw new Error("Internal Server Error");
  }
  const href = `${process.env.CLIENT_URL}/changePassword/${email}/${passwordToken}`;
  const html = `
    <h1>Password reset</h1>
    <a href=${href}>Click to update your password</a>
  `;
  sendMail(email, html, "Password reset");
  res.sendStatus(204);
};
var changePassword = async (req, res) => {
  const { email, passwordToken, password } = req.body;
  if (!email || !passwordToken || !password) {
    throw ApiError.badRequest([{ message: "Bad request" }]);
  }
  const user = await getByEmail(email);
  if (!user) {
    throw ApiError.notFound([{ message: "User not found " }]);
  }
  if (user?.passwordToken !== passwordToken) {
    throw ApiError.badRequest([{ for: "general", message: "Invalid or expired link" }]);
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  await change(user?.id, { password: hashedPassword, passwordToken: null });
  res.sendStatus(204);
};

// src/utils/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => fn(req, res, next).catch(next);
};

// src/middlewares/authMiddleware.ts
var authMiddleware = (req, res, next) => {
  const authorization = req.headers["authorization"] || "";
  const [, accessToken] = authorization?.split(" ");
  if (!authorization || !accessToken) {
    throw ApiError.authError([
      {
        message: "Access denied"
      }
    ]);
  }
  const normalizedUser = validateAccessToken(accessToken);
  if (!normalizedUser) {
    throw ApiError.badRequest([
      {
        message: "Bad access token"
      }
    ]);
  }
  req.normalizedUser = normalizedUser;
  next();
};

// src/routes/users.routes.ts
var router = Router();
router.get("/profile", authMiddleware, catchAsync(profile));
router.get("/activate/:email/:activationToken", catchAsync(activate));
router.post("/logout", authMiddleware, catchAsync(logout));
router.post("/login", catchAsync(login));
router.post("/sign-up", catchAsync(create2));
router.patch("/profile/changeName", authMiddleware, catchAsync(changeName));
router.patch("/profile/change", authMiddleware, catchAsync(changeSensetive));
router.post("/changePassword/generate", catchAsync(generatePasswordToken));
router.patch("/changePassword", catchAsync(changePassword));

// src/routes/tokens.routes.ts
import { Router as Router2 } from "express";

// src/controllers/tokens.controller.ts
import "dotenv/config";
var refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies["refreshToken"] || "";
  let normalizedUser = validateRefreshToken(refreshToken);
  if (!normalizedUser) {
    throw ApiError.authError([{
      message: "Unauthorized"
    }]);
  }
  const accessToken = generateAccessToken(
    normalize(normalizedUser)
  );
  res.statusCode = 201;
  res.send({ accessToken });
};
var checkAccess = async (req, res) => {
  const accessToken = req.headers["authorization"]?.split(" ")[1] || "";
  const data = validateAccessToken(accessToken);
  if (!data) {
    throw ApiError.authError([{
      message: "Invalid access key"
    }]);
  }
  res.sendStatus(204);
};

// src/routes/tokens.routes.ts
var router2 = Router2();
router2.post("/generate", catchAsync(refreshAccessToken));
router2.get("/checkAccess", catchAsync(checkAccess));

// src/createServer.ts
import cookieParser from "cookie-parser";

// src/middlewares/errorMiddleware.ts
var errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.statusCode = error.status;
    res.statusMessage = error.message;
    res.send(error.errors);
    return;
  }
  res.statusCode = 500;
  res.send({ errors: [{
    message: "Internal server error"
  }] });
};

// src/createServer.ts
function createServer() {
  const app = express();
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
  const corsOptions = {
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  };
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());
  app.use("/", router);
  app.use("/", router2);
  app.use(errorMiddleware);
  app.use((_, res) => {
    res.sendStatus(404);
  });
  return app;
}

// src/index.ts
var PORT = process.env.PORT || 3005;
createServer().listen(PORT, () => {
  console.log(`Server works on port ${PORT}`);
});
//# sourceMappingURL=index.js.map