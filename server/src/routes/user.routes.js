const express = require("express");
const userControler = require("../controlers/user.controler");
const userMiddleware = require("../middlewares/user.middleware");
const { catchError } = require("../middlewares/catchError");

const userRouter = new express.Router();

userRouter.get(
  "/users",
  userMiddleware.checkIsAuthorized,
  catchError(userControler.getAllActivated)
);

module.exports = userRouter;
