import { db } from '../db.ts';

import { categoriesTable } from '../schema/products.ts';

export async function setupCategories() {
  await db.insert(categoriesTable).values({ name: 'phones' });
  await db.insert(categoriesTable).values({ name: 'tablets' });
  await db.insert(categoriesTable).values({ name: 'accessories' });
}
