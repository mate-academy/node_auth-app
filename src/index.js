import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router as todoRouter } from "./routes/todo.route.js";
import { authRouter } from "./routes/auth.route.js";
import { client } from "./utils/db.js";
import "./models/Todo.js";
import "./models/User.js";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import { ApiError } from "./exeptions/api.error.js";

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/todos", todoRouter);
app.use("/", authRouter);

app.use((req, res, next) => {
  next(ApiError.notFound());
});

app.use(errorMiddleware);

client
  .sync()
  .then(() => {
    console.log("✅ Database connected and synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
