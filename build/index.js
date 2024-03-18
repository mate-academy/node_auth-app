var _a;
import 'dotenv/config';
import { createServer } from './app.js';
const app = createServer();
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on http://localhost:${PORT}`);
});
