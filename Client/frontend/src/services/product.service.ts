import api from "../lib/axios";

import type { Product } from "../types/product";

// =====================================================
// GET ALL PRODUCTS
// =====================================================

export async function getProducts(
  category?: string
): Promise<Product[]> {
  try {
    const response = await api.get(
      "/api/products/getall",
      {
        params:
          category &&
          category.toLowerCase() !== "all"
            ? { category }
            : undefined,
      }
    );

    return response.data.products;
  } catch (error) {
    console.error(
      "Error fetching products:",
      error
    );

    throw new Error(
      "Failed to fetch products"
    );
  }
}

// =====================================================
// GET SINGLE PRODUCT
// =====================================================

export async function getProductById(
  id: string
): Promise<Product> {
  try {
    const response = await api.get(
      `/api/products/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching product:",
      error
    );

    throw new Error(
      "Failed to fetch product"
    );
  }
}

// =====================================================
// CREATE PRODUCT
// =====================================================

export async function createProduct(
  formData: FormData
): Promise<Product> {
  try {
    const response = await api.post(
      "/api/products/create",
      formData
    );

    return response.data.product;
  } catch (error) {
    console.error(
      "Error creating product:",
      error
    );

    throw error;
  }
}

// =====================================================
// UPDATE PRODUCT
// =====================================================

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<Product> {
  try {
    const response = await api.put(
      `/api/products/${id}`,
      formData
    );

    return (
      response.data.product ||
      response.data.updatedProduct
    );
  } catch (error) {
    console.error(
      "Error updating product:",
      error
    );

    throw error;
  }
}

// =====================================================
// DELETE PRODUCT
// =====================================================

export async function deleteProduct(
  id: string
): Promise<{ message: string }> {
  try {
    const response = await api.delete(
      `/api/products/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error deleting product:",
      error
    );

    throw error;
  }
}