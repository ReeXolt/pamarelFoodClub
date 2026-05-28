import { Product } from '@/components/allProducts/data'
import { StaticImageData } from 'next/image'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

// export interface Product {
//   _id: string
//   name: string
//   sellingPrice: number
//   discountedPrice?: number | null
//   images: string[]
//   stock: number
//   category?: { name: string } | null
//   section?: string
// }

export type SelectedVariants = Record<string, string>

export interface CartItem {
  id: string | number
  name: string
  price: number
  discountedPrice: number | null
  image: string | StaticImageData
  quantity: number
  selectedVariants: SelectedVariants
  stock: number
  category?: string
  section?: string
}

interface CartState {
  items: CartItem[]
}

interface CartActions {
  addItem: (product: Product, quantity?: number, selectedVariants?: SelectedVariants) => void
  removeItem: (itemId: string|number, selectedVariants?: SelectedVariants) => void
  updateQuantity: (itemId: string|number, quantity: number, selectedVariants?: SelectedVariants) => void
  incrementQuantity: (itemId: string|number, selectedVariants?: SelectedVariants) => void
  decrementQuantity: (itemId: string|number, selectedVariants?: SelectedVariants) => void
  clearCart: () => void
  getItemQuantity: (itemId: string|number, selectedVariants?: SelectedVariants) => number
}

type CartStore = CartState & CartActions

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      items: [],

      // Actions
      addItem: (product, quantity = 1, selectedVariants = {}) => {
        const items = get().items
        const existingItemIndex = items.findIndex(
          (item) =>
            item.id === product._id &&
            JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
        )

        if (existingItemIndex > -1) {
          const updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
          set({ items: updatedItems })
        } else {
          const newItem: CartItem = {
            id: product._id,
            name: product.name,
            price: product.sellingPrice,
            discountedPrice: product.discountedPrice ?? null,
            image: product.images[0],
            quantity,
            selectedVariants,
            stock: product.stock,
            category: product.category?.name,
            section: product.section,
          }
          set({ items: [...items, newItem] })
        }
      },

      removeItem: (itemId, selectedVariants = {}) => {
        const items = get().items
        const updatedItems = items.filter(
          (item) =>
            !(
              item.id === itemId &&
              JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
            )
        )
        set({ items: updatedItems })
      },

      updateQuantity: (itemId, quantity, selectedVariants = {}) => {
        if (quantity < 1) {
          get().removeItem(itemId, selectedVariants)
          return
        }

        const items = get().items
        const updatedItems = items.map((item) =>
          item.id === itemId &&
          JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
            ? { ...item, quantity }
            : item
        )
        set({ items: updatedItems })
      },

      incrementQuantity: (itemId, selectedVariants = {}) => {
        const items = get().items
        const updatedItems = items.map((item) => {
          if (
            item.id === itemId &&
            JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
          ) {
            const newQuantity = item.quantity + 1
            if (newQuantity > item.stock) return item
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        set({ items: updatedItems })
      },

      decrementQuantity: (itemId, selectedVariants = {}) => {
        const items = get().items
        const updatedItems = items
          .map((item): CartItem | null => {
            if (
              item.id === itemId &&
              JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
            ) {
              const newQuantity = item.quantity - 1
              if (newQuantity < 1) {
                get().removeItem(itemId, selectedVariants)
                return null
              }
              return { ...item, quantity: newQuantity }
            }
            return item
          })
          .filter((item): item is CartItem => item !== null)

        set({ items: updatedItems })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getItemQuantity: (itemId, selectedVariants = {}) => {
        const items = get().items
        const item = items.find(
          (item) =>
            item.id === itemId &&
            JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
        )
        return item ? item.quantity : 0
      },
    }),
    {
      name: 'cart-storage',
      version: 1,
    }
  )
)

// ─── Helper functions ─────────────────────────────────────────────────────────

export const getCartCount = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.quantity, 0)

export const getCartTotal = (items: CartItem[]): number =>
  items.reduce((total, item) => {
    const price = item.discountedPrice ?? item.price
    return total + price * item.quantity
  }, 0)