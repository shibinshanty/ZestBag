import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Cart, CartItem } from "../../types/cart";

type CartState = {
  cart: Cart | null;
};

const initialState: CartState = {
  cart: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    // Set cart received from backend
    setCart: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
    },

    // Add item locally to Redux
    addToCart: (
      state,
      action: PayloadAction<{
        userId: string;
        item: CartItem;
      }>
    ) => {
      const { userId, item } = action.payload;

      // Create local cart if it does not exist
      if (!state.cart) {
        state.cart = {
          user: userId,
          items: [item],
        };

        return;
      }

      // Find existing product
      const existingItem = state.cart.items.find(
        (cartItem) =>
          cartItem.productId.toString() === item.productId.toString()
      );

      if (existingItem) {
        existingItem.quantity += Number(item.quantity);
      } else {
        state.cart.items.push(item);
      }
    },

    // Remove product completely from Redux
    removeFromCart: (
      state,
      action: PayloadAction<string>
    ) => {
      if (!state.cart) return;

      state.cart.items = state.cart.items.filter(
        (item) =>
          item.productId.toString() !== action.payload.toString()
      );
    },

    // Update product quantity locally
    updateCartQuantity: (
      state,
      action: PayloadAction<{
        productId: string;
        quantity: number;
      }>
    ) => {
      if (!state.cart) return;

      const { productId, quantity } = action.payload;

      const item = state.cart.items.find(
        (cartItem) =>
          cartItem.productId.toString() === productId.toString()
      );

      if (!item) return;

      if (quantity <= 0) {
        state.cart.items = state.cart.items.filter(
          (cartItem) =>
            cartItem.productId.toString() !== productId.toString()
        );
      } else {
        item.quantity = quantity;
      }
    },

    // Select or unselect item
    toggleItemSelection: (
      state,
      action: PayloadAction<string>
    ) => {
      if (!state.cart) return;

      const item = state.cart.items.find(
        (cartItem) =>
          cartItem.productId.toString() === action.payload.toString()
      );

      if (item) {
        item.selected = !item.selected;
      }
    },

    // Clear cart after logout or checkout
    clearCart: (state) => {
      state.cart = null;
    },
  },
});

export const {
  setCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  toggleItemSelection,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;