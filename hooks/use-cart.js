import { useCartStore } from '@/stores/cart-store';

export const useCart = () => {
  const {
    items,
    cartCount,
    cartTotal,
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getItemQuantity
  } = useCartStore();

  const addToCart = (product, quantity = 1, selectedVariants = {}) => {
    addItem(product, quantity, selectedVariants);
  };

  const removeFromCart = (productId, selectedVariants = {}) => {
    removeItem(productId, selectedVariants);
  };

  const isInCart = (productId, selectedVariants = {}) => {
    return getItemQuantity(productId, selectedVariants) > 0;
  };

  return {
    cartItems: items,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  };
};