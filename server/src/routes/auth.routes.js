const express = require("express");
const authControler = require("../controlers/auth.controler");
const authMiddleware = require("../middlewares/auth.middleware");
const { catchError } = require("../middlewares/catchError");
const ApiError = require("../exceptions/ApiError");

const authRouter = new express.Router();

authRouter.post(
  "/registration",
  authMiddleware.validateEmailAndPasswordReqParams,
  catchError(authControler.register)
  // #swagger.description = 'Register a new user.'
);
authRouter.get(
  "/activation/:activationToken",
  catchError(authControler.activate)
  // #swagger.description = 'Activate new user.'
);
authRouter.post(
  "/login",
  authMiddleware.validateEmailAndPasswordReqParams,
  catchError(authControler.login)
  // #swagger.description = 'Login user.'
);
authRouter.post(
  "/reset-password",
  authMiddleware.validateEmailReqParams,
  catchError(authControler.sendEmailForPasswordReset)
  // #swagger.description = 'Reset password of chosen user.'
);
authRouter.get(
  "/reset-password/:resetPasswordToken",
  catchError(authControler.checkResetPasswordToken)
  // #swagger.description = 'Check the reset password token.'
);
authRouter.post(
  "/reset-password/:resetPasswordToken",
  authMiddleware.validatePasswordReqParams,
  catchError(authControler.resetPassword)
  // #swagger.description = 'Reset password of chosen user.'
);
authRouter.get(
  "/refresh",
  catchError(authControler.refresh)
  // #swagger.description = 'Refresh token.'
);
authRouter.post(
  "/logout",
  catchError(authControler.logout)
  // #swagger.description = 'Logout user.'
);

module.exports = authRouter;
