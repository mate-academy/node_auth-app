/* eslint-disable quotes */
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authController } from "../controllers/authController.js";
import { catchError } from "../middlewares/catchError.js";

export const authRouter = new express.Router();

authRouter.post("/registration", catchError(authController.register));

authRouter.get(
  "/activation/:activationToken",
  catchError(authController.activate)
);

authRouter.get("/recover/:email", catchError(authController.recover));

authRouter.post(
  "/checkRecoverToken",
  catchError(authController.checkRecoverToken)
);
authRouter.post("/reset", catchError(authController.reset));

authRouter.post(
  "/resetAuth",
  catchError(authMiddleware),
  catchError(authController.reset)
);
authRouter.post("/login", catchError(authController.login));
authRouter.post("/logout", catchError(authController.logout));
authRouter.get("/refresh", catchError(authController.refresh));
authRouter.post("/reauth", catchError(authController.reauth));
