const express = require("express");
const userControler = require("../controlers/user.controler");
const userMiddleware = require("../middlewares/user.middleware");
const { catchError } = require("../middlewares/catchError");

const userRouter = new express.Router();

userRouter.get(
  "/users",
  userMiddleware.checkIsAuthorized,
  catchError(
    userControler.getAllActivated
    // #swagger.description = 'Return all activated users.'

    /* #swagger.responses[200] = {
        description: "Success",
        content: {
          "application/json": {
            schema:{
              $ref: "#/components/schemas/User"
            },
            example: {
              id: 1,
              email: "test@test.com",
            },
          }           
        }
      }   
    */

    // #swagger.responses[401] = { description: 'Unauthorized'}
  )
);

module.exports = userRouter;
