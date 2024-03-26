import 'dotenv/config';
import { createServer } from './app.js';

const app = await createServer();
const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
