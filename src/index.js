import express from "express";
import "dotenv/config";
import { authRouter } from "./routers/auth.router.js";
import cors from "cors";
import { usersRouter } from "./routers/users.router.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use(usersRouter);
app.use(errorMiddleware);
app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
