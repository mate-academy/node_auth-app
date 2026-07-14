import { sql } from 'drizzle-orm';
import { db } from '../db.ts';
import {
  accessoriesTable,
  categoriesTable,
  descriptionsTable,
  phonesTable,
  productsTable,
  tabletsTable,
} from '../schema/products.ts';
import { usersTable } from '../schema/users.ts';

export async function cleanAllTablets() {
  [
    categoriesTable,
    productsTable,
    tabletsTable,
    phonesTable,
    accessoriesTable,
    usersTable,
    descriptionsTable,
  ].forEach(async element => {
    await db.execute(sql`
      TRUNCATE TABLE ${element} RESTART IDENTITY CASCADE;
    `);
  });
}
