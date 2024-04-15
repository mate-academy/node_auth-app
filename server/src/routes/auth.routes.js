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

  // #swagger.responses[200] = { description: 'Success' }
  // #swagger.responses[400] = { description: 'BadRequest'}
);
authRouter.get(
  "/activation/:activationToken",
  catchError(authControler.activate)
  // #swagger.description = 'Activate new user.'

  // #swagger.responses[200] = { description: 'Success' }
  // #swagger.responses[404] = { description: 'Not Found' }
);
authRouter.post(
  "/login",
  authMiddleware.validateEmailAndPasswordReqParams,
  catchError(authControler.login)
  // #swagger.description = 'Login user.'

  /* #swagger.responses[200] = {
      description: "Success",
      content: {
        "application/json": {
          schema:{
            $ref: "#/components/schemas/UserWithAccessToken"
          },
          example:{
            user: {
              id: 1,
              email: "test@test.com",
            },
            accessToken: "eyJhbGciOiJIUzI1NiIsInR",
          }
        }           
      }
    }   
  */
  // #swagger.responses[400] = { description: 'BadRequest'}
  // #swagger.responses[403] = { description: 'Forbidden' }
);
authRouter.post(
  "/reset-password",
  authMiddleware.validateEmailReqParams,
  catchError(authControler.sendEmailForPasswordReset)
  // #swagger.description = 'Reset password of chosen user.'

  // #swagger.responses[200] = { description: 'Success' }
  // #swagger.responses[400] = { description: 'BadRequest'}
);
authRouter.get(
  "/reset-password/:resetPasswordToken",
  catchError(authControler.checkResetPasswordToken)
  // #swagger.description = 'Check the reset password token.'

  // #swagger.responses[200] = { description: 'Success' }
  // #swagger.responses[400] = { description: 'BadRequest'}
);
authRouter.post(
  "/reset-password/:resetPasswordToken",
  authMiddleware.validatePasswordReqParams,
  catchError(authControler.resetPassword)
  // #swagger.description = 'Reset password of chosen user.'

  // #swagger.responses[200] = { description: 'Success' }
  // #swagger.responses[400] = { description: 'BadRequest'}
);
authRouter.get(
  "/refresh",
  catchError(authControler.refresh)
  // #swagger.description = 'Refresh token.'

  /* #swagger.responses[200] = {
      description: "Success",
      content: {
        "application/json": {
          schema:{
            $ref: "#/components/schemas/UserWithAccessToken"
          },
          example:{
            user: {
              id: 1,
              email: "test@test.com",
            },
            accessToken: "eyJhbGciOiJIUzI1NiIsInR",
          }
        }           
      }
    }   
  */
  // #swagger.responses[401] = { description: 'Unauthorized' }
);
authRouter.post(
  "/logout",
  catchError(authControler.logout)
  // #swagger.description = 'Logout user.'

  // #swagger.responses[401] = { description: 'Unauthorized' }
  // #swagger.responses[204] = { description: 'Success' }
);

module.exports = authRouter;
