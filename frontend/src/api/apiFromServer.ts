import { httpClient } from '@/http/httpClient';
import { Product, ProductDetailsAll } from '@/shared/type';

const BASE_URL_SERVER = import.meta.env.VITE_APP_API_URL;

function wait(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

function getData<T>(url: string): Promise<T> {
  return wait(800)
    .then(() => httpClient.get(url))
    .then((response) => {
      return response as T;
    });
}

function getProducts() {
  return getData<Product[]>('/products');
}

function getProductsByCategoryServer(category: string) {
  return getData<Product[]>('/products?category=' + category);
}

function getProductDetails(
  itemId: string,
): Promise<ProductDetailsAll> {
  return getData<ProductDetailsAll>(`/products/details/${itemId}`);
}

function getProductsDetailsBySpaceId(
  namespaceId: string,
): Promise<ProductDetailsAll[]> {
  return getData<ProductDetailsAll[]>(`/products/details?namespaceId=${namespaceId}`);
}

function getImageUrl(url: string) {
  return BASE_URL_SERVER + '/api/' + url;
}

export const apiFromServer = {
  getProducts,
  getProductsByCategoryServer,
  getImageUrl,
  getProductDetails,
  getProductsDetailsBySpaceId,
};
