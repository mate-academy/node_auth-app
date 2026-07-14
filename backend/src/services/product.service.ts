import { db } from '../db/db.ts';
import {
  categoriesTable,
  productsTable,
  phonesTable,
  descriptionsTable,
  tabletsTable,
  accessoriesTable,
} from '../db/schema/products.ts';
import { eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

type NewProduct = InferInsertModel<typeof productsTable>;
type NewPhones = InferInsertModel<typeof phonesTable>;
type NewTablet = InferInsertModel<typeof tabletsTable>;
type NewAccessories = InferInsertModel<typeof accessoriesTable>;
type NewDescription = InferInsertModel<typeof descriptionsTable>;

type SelectProduct = InferSelectModel<typeof productsTable>;
type SelectPhones = InferSelectModel<typeof phonesTable>;
type SelectTablet = InferSelectModel<typeof tabletsTable>;
type SelectAccessories = InferSelectModel<typeof accessoriesTable>;
type SelectDescription = InferSelectModel<typeof descriptionsTable>;

function getProductsByCategory(
  categoty: 'accessories' | 'tablets' | 'phones' | (string & {}),
) {
  return db
    .select()
    .from(productsTable)
    .innerJoin(
      categoriesTable,
      eq(categoriesTable.id, productsTable.categoryId),
    )
    .where(eq(categoriesTable.name, categoty));
}

function getAllProduct() {
  return db.select().from(productsTable);
}

async function getProductDetails(id: number) {
  const [row] = await db
    .select()
    .from(productsTable)
    .leftJoin(phonesTable, eq(productsTable.id, phonesTable.id))
    .leftJoin(tabletsTable, eq(productsTable.id, tabletsTable.id))
    .leftJoin(accessoriesTable, eq(productsTable.id, accessoriesTable.id))
    .where(eq(productsTable.id, id));

  if (!row) return null;

  const details = row.phones ?? row.tablets ?? row.accessories;

  return {
    ...row.products,
    ...details,
  };
}

export const productService = {
  getProductsByCategory,
  getAllProduct,
  getProductDetails,
};
