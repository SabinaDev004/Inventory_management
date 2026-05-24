import { ApiResponse, Product } from "../types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`, {
      headers: {
        'Accept': 'application/ld+json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data: ApiResponse<Product> = await response.json();
    return data.member || [];
  },

  async create(product: Product): Promise<Product> {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description || "");
    formData.append('quantity', product.quantity.toString());
    formData.append('price', product.price);
    if (product.category && typeof product.category === 'string') {
      formData.append('category', product.category);
    }
    if (product.imageFile) {
      formData.append('imageFile', product.imageFile);
    }

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Text:', errorText);
      throw new Error(`Failed to create product: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async update(id: number, product: Product): Promise<Product> {
    const file = product.imageFile;
    const hasFile = file instanceof File;
    let body: BodyInit;
    let headers: Record<string, string> = {};

    if (hasFile) {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description || "");
      formData.append('quantity', product.quantity.toString());
      formData.append('price', product.price);
      if (product.category && typeof product.category === 'string') {
        formData.append('category', product.category);
      }
      formData.append('imageFile', file);
      body = formData;
    } else {
      headers = { 'Content-Type': 'application/ld+json' };
      body = JSON.stringify(product);
    }

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to update product');
    }

    return response.json();
  },

  async adjustStock(id: number, newQuantity: number): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/ld+json' },
      body: JSON.stringify({ quantity: newQuantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to adjust stock');
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  }
};
