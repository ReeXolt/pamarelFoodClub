import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price) {
  if (typeof price !== 'number') {
    price = Number(price) || 0;
  }
  
  return price.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/* ─── Animation variants ─── */
export const revealUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};
export const revealLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};
export const revealRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};
export const revealScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const routes = {
  home: "/",
  shop: {
    market: "/market",
    allProducts: "/category",
    singleProduct: (id) => `/product/${id}`,
  },
  benefits: "/join-member",
  stockist: "/apply-stockist",
  cart: "/cart",
  checkout: "/checkout",
  account: "/account",
  orders: "/orders",
  contact: "/contact",
};