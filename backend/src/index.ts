import 'dotenv/config';
import { createApp } from './server/createServer.ts';
import { productService } from './services/product.service.ts';

const app = createApp();

const port = process.env.PORT;

const server = app.listen(port || 3000, () => {
  console.log(`App listening on port ${port}`);
});
