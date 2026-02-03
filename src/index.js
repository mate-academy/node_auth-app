// index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.1.24:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
