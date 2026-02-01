"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  ChevronDown,
  SlidersHorizontal,
  Grid3X3,
  List
} from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

// Mock product data - replace with actual API call
const mockProducts = [
  {
    _id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 29999,
    images: ['/api/placeholder/300/300'],
    ratings: { average: 4.5, count: 128 },
    section: 'gadget',
    category: { name: 'Audio', slug: 'audio' },
    featured: true,
    flashSale: { active: true, discountPercentage: 20 }
  },
  {
    _id: '2',
    name: 'Organic Coffee Beans',
    price: 4500,
    images: ['/api/placeholder/300/300'],
    ratings: { average: 4.2, count: 89 },
    section: 'food',
    category: { name: 'Beverages', slug: 'beverages' },
    featured: false,
    flashSale: { active: false }
  },
  // Add more mock products as needed
]

const DISCOUNT_PERCENTAGES = [50, 40, 30, 20, 10]
const SECTIONS = [
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'gadget', label: 'Gadgets', icon: '📱' }
]

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'best-rated', label: 'Best Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' }
]

// Product Card Component
const ProductCard = ({ product }) => {
  const isFlashSaleActive = product.flashSale?.active
  
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}
          {isFlashSaleActive && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {product.flashSale.discountPercentage}% OFF
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
            {product.name}
          </h3>
        </div>

        {/* <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3 h-3 ${
                star <= Math.floor(product.ratings.average)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">
            ({product.ratings.count})
          </span>
        </div> */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isFlashSaleActive ? (
              <>
                <span className="text-lg font-bold text-red-600">
                  ₦{(product.price * (1 - product.flashSale.discountPercentage / 100)).toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₦{product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-green-600">
                  ₦{formatPrice(product.sellingPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₦{formatPrice(product.price)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span className="capitalize">{product.section}</span>
          <span>{product.category.name}</span>
        </div>
      </div>
    </div>
  )
}

// Filter Section Component
const FilterSection = ({ title, children, isOpen = false }) => {
  const [open, setOpen] = useState(isOpen)

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span className="font-semibold text-gray-900">{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

// Checkbox Component
const FilterCheckbox = ({ id, label, checked, onChange, count }) => {
  return (
    <label htmlFor={id} className="flex items-center justify-between py-2 cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
          />
        </div>
        <span className="text-sm text-gray-700 group-hover:text-yellow-600 transition-colors">
          {label}
        </span>
      </div>
      {count && (
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </label>
  )
}

export default function CategoryPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('cat')
  const initialSearchQuery = searchParams.get('q')


  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? ['new category'] : [])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedDiscounts, setSelectedDiscounts] = useState([])
  const [selectedSections, setSelectedSections] = useState([])
  const [sortOption, setSortOption] = useState('popular')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const productsPerPage = 12

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        if (data.success) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        // Build query parameters for the new endpoint
        const params = new URLSearchParams()
        
        // Add pagination
        params.append('page', currentPage.toString())
        params.append('limit', productsPerPage.toString())
        
        // Add category filter if selected
        if (selectedCategories.length > 0) {
          params.append('category', selectedCategories.join(','))
        }
        
        // Add search query if exists
        if (searchQuery) {
          params.append('search', searchQuery)
        }
        
        // Add price filters
        if (priceRange.min) params.append('minPrice', priceRange.min)
        if (priceRange.max) params.append('maxPrice', priceRange.max)
        
        // Add section filters
        if (selectedSections.length > 0) {
          params.append('sections', selectedSections.join(','))
        }
        
        // Add discount filters
        if (selectedDiscounts.length > 0) {
          params.append('minDiscount', Math.min(...selectedDiscounts).toString())
        }
        
        // Add sort option
        params.append('sort', sortOption)

        const response = await fetch(`/api/products/filter?${params}`)
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.products)
          setTotalProducts(data.pagination.total)
        } else {
          console.error('Error fetching products:', data.error)
          setProducts([])
          setTotalProducts(0)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setTotalProducts(0)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [selectedCategories, currentPage, searchQuery, priceRange, selectedDiscounts, selectedSections, sortOption])
  
  // Handle category selection
  const handleCategoryChange = (categorySlug, checked) => {
    setSelectedCategories(prev =>
      checked ? [...prev, categorySlug] : prev.filter(c => c !== categorySlug)
    )
    setCurrentPage(1)
  }

  // Handle section selection
  const handleSectionChange = (sectionId, checked) => {
    setSelectedSections(prev =>
      checked ? [...prev, sectionId] : prev.filter(s => s !== sectionId)
    )
    setCurrentPage(1)
  }

  // Handle discount selection
  const handleDiscountChange = (discount, checked) => {
    setSelectedDiscounts(prev =>
      checked ? [...prev, discount] : prev.filter(d => d !== discount)
    )
    setCurrentPage(1)
  }

  // Apply price filter
  const applyPriceFilter = () => {
    setCurrentPage(1)
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedSections([])
    setSelectedDiscounts([])
    setPriceRange({ min: '', max: '' })
    setSearchQuery('')
    setCurrentPage(1)
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedSections.length > 0 || 
                           selectedDiscounts.length > 0 || priceRange.min || priceRange.max

  // Generate page title
  const pageTitle = searchQuery 
    ? `Search results for "${searchQuery}"`
    : selectedCategories.length > 0
      ? categories.find(cat => cat.slug === selectedCategories[0])?.name || 'Category'
      : "All Products"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-25" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Mobile Filter Content */}
              <div className="space-y-6">
                {/* Categories */}
                <FilterSection title="Categories" isOpen={true}>
                  <div className="space-y-1">
                    {categories.map(category => (
                      <FilterCheckbox
                        key={category._id}
                        id={`mobile-cat-${category.name}`}
                        label={category.name}
                        checked={selectedCategories.includes(category.name)}
                        onChange={(e) => handleCategoryChange(category.name, e.target.checked)}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* Sections */}
                <FilterSection title="Sections">
                  <div className="space-y-1">
                    {SECTIONS.map(section => (
                      <FilterCheckbox
                        key={section.id}
                        id={`mobile-section-${section.id}`}
                        label={`${section.icon} ${section.label}`}
                        checked={selectedSections.includes(section.id)}
                        onChange={(e) => handleSectionChange(section.id, e.target.checked)}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Price Range (₦)">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      />
                    </div>
                    <button
                      onClick={applyPriceFilter}
                      className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Apply Price Filter
                    </button>
                  </div>
                </FilterSection>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
              <p className="text-gray-600 mt-2">
                {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
                {hasActiveFilters && ' · Filters applied'}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block space-y-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-yellow-600 hover:text-yellow-700"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <FilterSection title="Categories" isOpen={true}>
                <div className="space-y-1">
                  {categories.map(category => (
                    <FilterCheckbox
                      key={category._id}
                      id={`cat-${category.name}`}
                      label={category.name}
                      checked={selectedCategories.includes(category.name)}
                      onChange={(e) => handleCategoryChange(category.name, e.target.checked)}
                    />
                  ))}
                </div>
              </FilterSection>
            </div>

            {/* Sections */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <FilterSection title="Sections">
                <div className="space-y-1">
                  {SECTIONS.map(section => (
                    <FilterCheckbox
                      key={section.id}
                      id={`section-${section.id}`}
                      label={`${section.icon} ${section.label}`}
                      checked={selectedSections.includes(section.id)}
                      onChange={(e) => handleSectionChange(section.id, e.target.checked)}
                    />
                  ))}
                </div>
              </FilterSection>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <FilterSection title="Price Range (₦)">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                  <button
                    onClick={applyPriceFilter}
                    className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Apply Price Filter
                  </button>
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'grid' 
                        ? 'bg-yellow-500 text-white' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'list' 
                        ? 'bg-yellow-500 text-white' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <Link key={product._id} href={`/product/${product._id}`}>
                      <ProductCard product={product} />
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {Math.ceil(totalProducts / productsPerPage) > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex gap-2">
                      {[...Array(Math.ceil(totalProducts / productsPerPage))].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-4 py-2 rounded-lg border ${
                            currentPage === i + 1
                              ? 'bg-yellow-500 text-white border-yellow-500'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}