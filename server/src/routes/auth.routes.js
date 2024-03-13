const express = require("express");
const authControler = require("../controlers/auth.controler");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = new express.Router();

authRouter.get("/", authControler.getAll);
authRouter.post(
  "/registration",
  // authMiddleware.validateEmailAndPasswordReqParams,
  authMiddleware.checkIsEmailAlreadyExistInDB,
  authControler.register
);
authRouter.get("/activation/:activationToken", authControler.activate);
authRouter.post(
  "/login",
  // authMiddleware.validateEmailAndPasswordReqParams,
  authControler.login
);
authRouter.post("/logout", authControler.logout);

module.exports = authRouter;
