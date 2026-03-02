import { createServer } from "./createServer.ts";

const PORT = process.env.PORT || 3005;

createServer().listen(PORT, () => {
  console.log(`Server works on port ${PORT}`);
})
