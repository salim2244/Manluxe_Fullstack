export interface ProductSize {
  id: number;
  size: string;
  stock: number;
}

export interface Product {

  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  brand: string;
  gender: string;
  imageUrl: string;
  active: boolean;
  categoryId: number;
  categoryName: string;

  sizeType: string;

  sizes: ProductSize[];
}

export interface ProductRequest {

  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  brand: string;
  gender: string;
  imageUrl: string;
  active: boolean;
  categoryId: number;

  sizeType: string;

  sizes: {
    size: string;
    stock: number;
  }[];
}