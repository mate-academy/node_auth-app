import { createServer } from "./createServer.ts";

createServer().listen(3005, () => {
  console.log('Server works');
})
