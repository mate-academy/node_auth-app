'use strict';
import "dotenv/config";
import { createServer } from "./createServer.js";

const PORT = process.env.PORT || 3005;

createServer().listen(PORT, () => {
  console.log("Server is running");
})
