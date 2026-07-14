import phonesJson from '../../../public/api/phones.json' with { type: 'json' };
import tabletsJson from '../../../public/api/tablets.json' with { type: 'json' };
import accessoriesJson from '../../../public/api/accessories.json' with { type: 'json' };
import productJson from '../../../public/api/products.json' with { type: 'json' };
import { db } from '../db.ts';
import {
  categoriesTable,
  productsTable,
  phonesTable,
  descriptionsTable,
  tabletsTable,
  accessoriesTable,
} from '../schema/products.ts';
import { eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

type NewProduct = InferInsertModel<typeof productsTable>;

export async function setupPnones() {
  const categories = await db.select().from(categoriesTable);

  phonesJson.forEach(async phone => {
    const product = productJson.find(product => phone.id === product.itemId);

    if (!product) {
      throw new Error('Нет product');
    }

    const categoryId = categories.find(
      item => product.category === item.name,
    )?.id;

    if (!categoryId) {
      throw new Error('Нет category');
    }

    const newProduct: NewProduct = {
      name: product.name,
      year: product.year,
      categoryId: categoryId,
      namespaceId: phone.namespaceId,
      fullPrice: product.fullPrice,
      price: product.price,
      screen: product.screen,
      capacity: product.capacity,
      color: product.color,
      ram: product.ram,
      images: phone.images,
      generalImage: product.image,
    };

    const newProductId = (
      await db
        .insert(productsTable)
        .values(newProduct)
        .returning({ id: productsTable.id })
    )[0]?.id;

    if (!newProductId) {
      throw new Error('Нет newProductId');
    }

    await db.insert(phonesTable).values({
      id: newProductId,
      resolution: phone.resolution,
      processor: phone.processor,
      camera: phone.camera,
      zoom: phone.zoom,
      cell: phone.cell,
    });

    for (const descript of phone.description) {
      await db.insert(descriptionsTable).values({
        productId: newProductId,
        title: descript.title,
        text: descript.text,
        lang: 'en',
      });
    }

    for (const descript of phone.descriptionUa) {
      await db.insert(descriptionsTable).values({
        productId: newProductId,
        title: descript.title,
        text: descript.text,
        lang: 'ua',
      });
    }
  });
}

export async function setupTablets() {
  const categories = await db.select().from(categoriesTable);

  tabletsJson.forEach(async tablet => {
    const product = productJson.find(product => tablet.id === product.itemId);

    if (!product) {
      throw new Error('Нет product');
    }

    const categoryId = categories.find(
      item => product.category === item.name,
    )?.id;

    if (!categoryId) {
      throw new Error('Нет category');
    }

    const newProduct: NewProduct = {
      name: product.name,
      year: product.year,
      categoryId: categoryId,
      namespaceId: tablet.namespaceId,
      fullPrice: product.fullPrice,
      price: product.price,
      screen: product.screen,
      capacity: product.capacity,
      color: product.color,
      ram: product.ram,
      images: tablet.images,
      generalImage: product.image,
    };

    const newProductId = (
      await db
        .insert(productsTable)
        .values(newProduct)
        .returning({ id: productsTable.id })
    )[0]?.id;

    if (!newProductId) {
      throw new Error('Нет newProductId');
    }

    await db.insert(tabletsTable).values({
      id: newProductId,
      resolution: tablet.resolution,
      processor: tablet.processor,
      camera: tablet.camera,
      zoom: tablet.zoom,
      cell: tablet.cell,
    });

    for (const descript of tablet.description) {
      await db.insert(descriptionsTable).values({
        productId: newProductId,
        title: descript.title,
        text: descript.text,
        lang: 'en',
      });
    }

    for (const descript of tablet.descriptionUa) {
      await db.insert(descriptionsTable).values({
        productId: newProductId,
        title: descript.title,
        text: descript.text,
        lang: 'ua',
      });
    }
  });
}

export async function setupAccessories() {
  const categories = await db.select().from(categoriesTable);

  accessoriesJson.forEach(async accessory => {
    const product = productJson.find(
      product => accessory.id === product.itemId,
    );

    if (!product) {
      throw new Error('Нет product');
    }

    const categoryId = categories.find(
      item => product.category === item.name,
    )?.id;

    if (!categoryId) {
      throw new Error('Нет category');
    }

    const newProduct: NewProduct = {
      name: product.name,
      year: product.year,
      categoryId: categoryId,
      namespaceId: accessory.namespaceId,
      fullPrice: product.fullPrice,
      price: product.price,
      screen: product.screen,
      capacity: product.capacity,
      color: product.color,
      ram: product.ram,
      images: accessory.images,
      generalImage: product.image,
    };

    const newProductId = (
      await db
        .insert(productsTable)
        .values(newProduct)
        .returning({ id: productsTable.id })
    )[0]?.id;

    if (!newProductId) {
      throw new Error('Нет newProductId');
    }

    await db.insert(accessoriesTable).values({
      id: newProductId,
      resolution: accessory.resolution,
      processor: accessory.processor,
      cell: accessory.cell,
    });

    for (const descript of accessory.description) {
      await db.insert(descriptionsTable).values({
        productId: newProductId,
        title: descript.title,
        text: descript.text,
        lang: 'en',
      });
    }

    for (const descript of accessory.descriptionUa) {
      await db.insert(descriptionsTable).values({
        productId: newProductId,
        title: descript.title,
        text: descript.text,
        lang: 'ua',
      });
    }
  });
}
