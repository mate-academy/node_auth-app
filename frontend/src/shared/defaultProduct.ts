import { Product } from './type';

export const defaultProduct: Product = {
  id: 243,
  categoryId: 1,
  namespaceId: 'apple-iphone-13-pro-max',
  name: 'Apple iPhone 13 Pro Max 1TB Gold',
  fullPrice: 1740,
  price: 1520,
  screen: "6.1' OLED",
  capacity: '1TB',
  color: 'gold',
  ram: '6GB',
  year: 2022,
  images: [
    'img/phones/apple-iphone-13-pro-max/gold/00.webp',
    'img/phones/apple-iphone-13-pro-max/gold/01.webp',
    'img/phones/apple-iphone-13-pro-max/gold/02.webp',
    'img/phones/apple-iphone-13-pro-max/gold/03.webp',
  ],
  generalImage: 'img/phones/apple-iphone-13-pro-max/gold/00.webp',
  category: 'phones',
};
