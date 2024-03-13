const express = require("express");
const userControler = require("../controlers/user.controler");

const userRouter = new express.Router();

userRouter.get("/users", userControler.getAllActivated);

module.exports = userRouter;
