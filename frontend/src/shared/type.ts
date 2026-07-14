export type Category = 'phones' | 'tablets' | 'accessories';

export type Product = {
  id: number;
  categoryId: number;
  namespaceId: string;
  name: string;
  fullPrice: number;
  price: number;
  screen: string;
  capacity: string;
  color: string;
  ram: string;
  year: number;
  images: string[];
  generalImage: string;
  category: string;
};

type ProductDetailsBase = Omit<Product, 'category'> & {
  category: {
    id: number;
    name: CategoryName;
  };
  descriptions: {
    text: string[];
    id: number;
    productId: number;
    lang: string;
    title: string;
  }[];
};

type PhoneDetails = {
  id: number;
  resolution: string;
  processor: string;
  camera: string;
  zoom: string;
  cell: string[];
};

type TabletDetails = {
  id: number;
  resolution: string;
  processor: string;
  camera: string;
  zoom: string;
  cell: string[];
};

type AccessoriesDetails = {
  id: number;
  resolution: string;
  processor: string;
  cell: string[];
};

type DetailsMap = {
  phones: PhoneDetails | null;
  tablets: TabletDetails | null;
  accessories: AccessoriesDetails | null;
};

type CategoryName = keyof DetailsMap;

export type ProductDetailsAll = ProductDetailsBase & DetailsMap;

export type ProductInCart = {
  id: string;
  count: number;
};

export type AuthUser = {
  id: string;
  email: string;
  role: 'user' | 'admin';
  lastName: string;
  firstName: string;
};
