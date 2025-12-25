import express from "express";
import "dotenv/config";
import { authRouter } from "./api/routers/auth.router.js";
import cors from "cors";
import { userRouter } from "./api/routers/user.router.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import cookieParser from "cookie-parser";
import { passwordResetRouter } from "./api/routers/passwordReset.router.js";
import { profileRouter } from "./api/routers/profile.router.js";

export function createServer() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }))
  app.use(authRouter);
  app.use('/users', userRouter);
  app.use('/password-reset', passwordResetRouter);
  app.use('/profile', profileRouter);

  app.get('/', (req, res) => {
    res.send('Server is active');
  });

  app.use((req, res, next) => {
    next(ApiError.notFound({ path: req.path }));
  });

  app.use(errorMiddleware)

  return app;
}
