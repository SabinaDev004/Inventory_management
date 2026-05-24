import { ApiResponse, Category } from "../types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await fetch(`${API_URL}/categories`, {
      headers: {
        'Accept': 'application/ld+json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data: ApiResponse<Category> = await response.json();
    return data.member || [];
  },

  async create(category: { name: string }): Promise<Category> {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      throw new Error('Failed to create category');
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete category');
    }
  }
};
