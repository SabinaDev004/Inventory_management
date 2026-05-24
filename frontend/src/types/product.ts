export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id?: number;
  name: string;
  description?: string;
  quantity: number;
  price: string;
  category?: string | Category;
  imageName?: string;
  imageFile?: File; // Para la subida
}

export interface ApiResponse<T> {
  member: T[];
  totalItems: number;
}
