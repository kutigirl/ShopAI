import { Product } from '@app-types';

/**
 * Product Service — Giao tiếp với API lấy danh sách sản phẩm
 * File: src/services/productService.ts
 */
const API_URL = 'https://fakestoreapi.com/products?limit=8';

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Lỗi tải dữ liệu: ${response.status} ${response.statusText}`);
  }
  const data: Product[] = await response.json();
  return data;
}
