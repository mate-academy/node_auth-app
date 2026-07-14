import { Router, type Request, type Response } from 'express';
import { db } from '../../db/db.ts';
import {
  and,
  eq,
  SQL,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm';
import {
  accessoriesTable,
  categoriesTable,
  descriptionsTable,
  phonesTable,
  productsTable,
  tabletsTable,
} from '../../db/schema/products.ts';

export const productsRoute = Router();

type ProductsQuery = {
  category?: string;
  namespaceid?: string;
};

productsRoute.get(
  '/details/:productId',
  async (req: Request<{ productId: string }>, res) => {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).send({ message: 'Invalid product id' });
    }

    const product = await db.query.productsTable.findFirst({
      with: {
        category: true,
        tablets: true,
        phones: true,
        accessories: true,
        descriptions: true,
      },
      where: { id: productId },
    });

    if (!product) {
      return res.sendStatus(404);
    }

    res.send(product);
  },
);

productsRoute.get(
  '/details',
  async (req: Request<{}, {}, {}, { namespaceId?: string }>, res) => {
    const { namespaceId: namespaceid } = req.query;

    if (!namespaceid) {
      return res.status(400).send({ message: 'Invalid product namespaceid' });
    }

    const products = await db.query.productsTable.findMany({
      with: {
        category: true,
        tablets: true,
        phones: true,
        accessories: true,
        descriptions: true,
      },
      where: { namespaceId: namespaceid },
    });

    if (!products) {
      return res.sendStatus(404);
    }

    res.send(products);
  },
);

productsRoute.get(
  '/',
  async (req: Request<{}, {}, {}, ProductsQuery>, res: Response) => {
    const { category, namespaceid } = req.query;

    const conditions: SQL[] = [];

    if (category) {
      conditions.push(eq(categoriesTable.name, category));
    }

    if (namespaceid) {
      conditions.push(eq(productsTable.namespaceId, namespaceid));
    }

    const result = await db
      .select({
        id: productsTable.id,
        categoryId: productsTable.categoryId,
        namespaceId: productsTable.namespaceId,
        name: productsTable.name,
        fullPrice: productsTable.fullPrice,
        price: productsTable.price,
        screen: productsTable.screen,
        capacity: productsTable.capacity,
        color: productsTable.color,
        ram: productsTable.ram,
        year: productsTable.year,
        images: productsTable.images,
        generalImage: productsTable.generalImage,
        category: categoriesTable.name,
      })
      .from(productsTable)
      .leftJoin(
        categoriesTable,
        eq(categoriesTable.id, productsTable.categoryId),
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return res.json(result);
  },
);
