import { cleanAllTablets } from './cleanAllTablets.ts';
import { setupCategories } from './setupCategory.ts';
import {
  setupAccessories,
  setupPnones,
  setupTablets,
} from './setupCreateProducts.ts';

await cleanAllTablets();

await setupCategories();
await setupPnones();
await setupTablets();
await setupAccessories();

console.log('Setup is success');
