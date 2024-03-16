const express = require("express");
const authControler = require("../controlers/auth.controler");
const authMiddleware = require("../middlewares/auth.middleware");
const { catchError } = require("../middlewares/catchError");

const authRouter = new express.Router();

authRouter.get("/", catchError(authControler.getAll));
authRouter.post(
  "/registration",
  authMiddleware.validateEmailAndPasswordReqParams,
  catchError(authControler.register)
);
authRouter.get(
  "/activation/:activationToken",
  catchError(authControler.activate)
);
authRouter.post(
  "/login",
  authMiddleware.validateEmailAndPasswordReqParams,
  catchError(authControler.login)
);
authRouter.get("/refresh", catchError(authControler.refresh));
authRouter.post("/logout", catchError(authControler.logout));

module.exports = authRouter;
