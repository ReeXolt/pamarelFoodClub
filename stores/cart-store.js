import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      
      // Actions
      addItem: (product, quantity = 1, selectedVariants = {}) => {
        const items = get().items
        const existingItemIndex = items.findIndex(item => 
          item.id === product._id && 
          JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
        )
        
        if (existingItemIndex > -1) {
          // Update quantity if item exists
          const updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
          set({ items: updatedItems })
        } else {
          // Add new item
          const newItem = {
            id: product._id,
            name: product.name,
            price: product.sellingPrice,
            discountedPrice: product.discountedPrice || null,
            image: product.images[0],
            quantity,
            selectedVariants,
            stock: product.stock,
            category: product.category?.name,
            section: product.section
          }
          set({ items: [...items, newItem] })
        }
      },
      
      removeItem: (itemId, selectedVariants = {}) => {
        const items = get().items
        const updatedItems = items.filter(item => 
          !(item.id === itemId && 
            JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants))
        )
        set({ items: updatedItems })
      },
      
      updateQuantity: (itemId, quantity, selectedVariants = {}) => {
        if (quantity < 1) {
          get().removeItem(itemId, selectedVariants)
          return
        }
        
        const items = get().items
        const updatedItems = items.map(item =>
          item.id === itemId && 
          JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
            ? { ...item, quantity }
            : item
        )
        set({ items: updatedItems })
      },
      
      incrementQuantity: (itemId, selectedVariants = {}) => {
        const items = get().items
        const updatedItems = items.map(item => {
          if (item.id === itemId && 
              JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)) {
            const newQuantity = item.quantity + 1
            // Check if quantity exceeds stock
            if (newQuantity > item.stock) {
              return item // Don't exceed stock
            }
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        set({ items: updatedItems })
      },
      
      decrementQuantity: (itemId, selectedVariants = {}) => {
        const items = get().items
        const updatedItems = items.map(item => {
          if (item.id === itemId && 
              JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)) {
            const newQuantity = item.quantity - 1
            if (newQuantity < 1) {
              get().removeItem(itemId, selectedVariants)
              return null
            }
            return { ...item, quantity: newQuantity }
          }
          return item
        }).filter(Boolean)
        
        set({ items: updatedItems })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getItemQuantity: (itemId, selectedVariants = {}) => {
        const items = get().items
        const item = items.find(item => 
          item.id === itemId && 
          JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
        )
        return item ? item.quantity : 0
      }
    }),
    {
      name: 'cart-storage',
      version: 1,
    }
  )
)

// Helper functions to compute cart values
export const getCartCount = (items) => {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export const getCartTotal = (items) => {
  return items.reduce((total, item) => {
    const price = item.discountedPrice || item.price
    return total + (price * item.quantity)
  }, 0)
}