"use strict";

require("dotenv/config");
const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth.routes");
const userRouter = require("./routes/user.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use(userRouter);
app.use(errorMiddleware);

// for all other pages
app.use((req, res, next) => {
  next(ApiError.NotFound());
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on the ${process.env.SERVER_URL}`);
});
