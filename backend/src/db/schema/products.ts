import { integer, pgSchema, varchar, text } from 'drizzle-orm/pg-core';
import { defineRelations } from 'drizzle-orm';

export const productsSchema = pgSchema('products');

export const productsTable = productsSchema.table('products', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer('category_id')
    .references(() => categoriesTable.id)
    .notNull(),
  namespaceId: varchar('namespace_id', { length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  fullPrice: integer().notNull(),
  price: integer().notNull(),
  screen: varchar({ length: 255 }).notNull(),
  capacity: varchar({ length: 255 }).notNull(),
  color: varchar({ length: 255 }).notNull(),
  ram: varchar({ length: 255 }).notNull(),
  year: integer().notNull(),
  images: text().array().notNull(),
  generalImage: text('general_image').notNull(),
});

export const phonesTable = productsSchema.table('phones', {
  id: integer('id')
    .primaryKey()
    .references(() => productsTable.id),
  resolution: varchar({ length: 255 }).notNull(),
  processor: varchar({ length: 255 }).notNull(),
  camera: varchar({ length: 255 }).notNull(),
  zoom: varchar({ length: 255 }).notNull(),
  cell: varchar({ length: 255 }).array().notNull(),
});

export const tabletsTable = productsSchema.table('tablets', {
  id: integer('id')
    .primaryKey()
    .references(() => productsTable.id),
  resolution: varchar({ length: 255 }).notNull(),
  processor: varchar({ length: 255 }).notNull(),
  camera: varchar({ length: 255 }).notNull(),
  zoom: varchar({ length: 255 }).notNull(),
  cell: varchar({ length: 255 }).array().notNull(),
});

export const accessoriesTable = productsSchema.table('accessories', {
  id: integer('id')
    .primaryKey()
    .references(() => productsTable.id),
  resolution: varchar({ length: 255 }).notNull(),
  processor: varchar({ length: 255 }).notNull(),
  cell: varchar({ length: 255 }).array().notNull(),
});

export const descriptionsTable = productsSchema.table('descriptions', {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),

  productId: integer('product_id')
    .notNull()
    .references(() => productsTable.id),

  lang: varchar({ length: 2 }).notNull(), // 'en' | 'ua'

  title: text().notNull(),
  text: text().array().notNull(),
});

export const categoriesTable = productsSchema.table('categories', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const relations = defineRelations(
  {
    productsTable,
    categoriesTable,
    phonesTable,
    descriptionsTable,
    tabletsTable,
    accessoriesTable,
  },
  r => ({
    productsTable: {
      category: r.one.categoriesTable({
        from: r.productsTable.categoryId,
        to: r.categoriesTable.id,
      }),

      descriptions: r.many.descriptionsTable({
        from: r.productsTable.id,
        to: r.descriptionsTable.productId,
      }),

      phones: r.one.phonesTable({
        from: r.productsTable.id,
        to: r.phonesTable.id,
      }),

      tablets: r.one.tabletsTable({
        from: r.productsTable.id,
        to: r.tabletsTable.id,
      }),

      accessories: r.one.accessoriesTable({
        from: r.productsTable.id,
        to: r.accessoriesTable.id,
      }),
    },

    categoriesTable: {
      products: r.many.productsTable(),
    },

    phonesTable: {
      product: r.one.productsTable({
        from: r.phonesTable.id,
        to: r.productsTable.id,
      }),
    },

    tabletsTable: {
      product: r.one.productsTable({
        from: r.tabletsTable.id,
        to: r.productsTable.id,
      }),
    },

    accessoriesTable: {
      product: r.one.productsTable({
        from: r.accessoriesTable.id,
        to: r.productsTable.id,
      }),
    },

    descriptionsTable: {
      product: r.one.productsTable({
        from: r.descriptionsTable.productId,
        to: r.productsTable.id,
      }),
    },
  }),
);
