import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, CartItem } from '@/utils/APiCalls';
import { Storage } from '@/services/storageService';

const STORAGE_KEY_CART = 'amrutam_persistent_cart';
const STORAGE_KEY_WISHLIST = 'amrutam_persistent_wishlist';

interface CartState {
  cart: CartItem[];
  wishlist: Product[];
}

const initialState: CartState = {
  cart: Storage.getItem<CartItem[]>(STORAGE_KEY_CART, []) || [],
  wishlist: Storage.getItem<Product[]>(STORAGE_KEY_WISHLIST, []) || [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity?: number }>) => {
      const { product, quantity = 1 } = action.payload;
      const index = state.cart.findIndex((item) => item.product.id === product.id);
      if (index > -1) {
        state.cart[index].quantity += quantity;
      } else {
        state.cart.push({ product, quantity });
      }
      Storage.setItem(STORAGE_KEY_CART, state.cart);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((item) => item.product.id !== action.payload);
      Storage.setItem(STORAGE_KEY_CART, state.cart);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.cart = state.cart.filter((item) => item.product.id !== productId);
      } else {
        const item = state.cart.find((i) => i.product.id === productId);
        if (item) item.quantity = quantity;
      }
      Storage.setItem(STORAGE_KEY_CART, state.cart);
    },
    clearCart: (state) => {
      state.cart = [];
      Storage.removeItem(STORAGE_KEY_CART);
    },
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const index = state.wishlist.findIndex((p) => p.id === product.id);
      if (index > -1) {
        state.wishlist.splice(index, 1);
      } else {
        state.wishlist.push(product);
      }
      Storage.setItem(STORAGE_KEY_WISHLIST, state.wishlist);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist } = cartSlice.actions;
export default cartSlice.reducer;
