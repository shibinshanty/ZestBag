import api from "../lib/axios";
import type { CartItem } from "../types/cart";

// Get cart from backend
export async function getCart() {
  const response = await api.get("/api/cart/productcart");

  console.log("Cart response:", response.data);

  return response.data;
}

// Add product to cart
export async function addToCart(item: CartItem) {
  const response = await api.post("/api/cart/add", item);

  return response.data.cart;
}

// Remove product quantity from cart
export async function removeQuantity(
  productId: string,
  quantity: number
) {
  const response = await api.post("/api/cart/remove", {
    productId,
    quantity,
  });

  return response.data;
}

// Delete product from cart
export async function deleteFromCart(productId: string) {
  const response = await api.delete("/api/cart/delete", {
    data: {
      productId,
    },
  });

  return response.data;
}