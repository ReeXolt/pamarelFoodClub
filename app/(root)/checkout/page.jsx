"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Truck, Wallet, ChevronDown, ChevronUp, Plus, AlertCircle, Store } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { FundWalletModal } from "@/components/wallets/FundWalletModal"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useCartStore, getCartTotal } from "@/stores/cart-store"
import { Country, State, City } from 'country-state-city'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wallets, setWallets] = useState({})
  const [walletLoading, setWalletLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showWallet, setShowWallet] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState('standard')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [selectedWallet, setSelectedWallet] = useState('cash')
  const [shippingRates, setShippingRates] = useState([])
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [deliveryPrices, setDeliveryPrices] = useState({
    standard: 0,
    express: 0,
    pickup: 0
  })
  const [selectedPickupCenter, setSelectedPickupCenter] = useState('')

  // Pickup centers data
  const pickupCenters = [
    {
      id: 'warri',
      name: 'Warri South',
      address: 'Uroye Street, Ubeji, Warri',
      phone: '0920203',
      hours: 'Mon-Sat: 9am - 5pm',
      daysOpen: 'Monday - Saturday'
    },
    {
      id: 'uyo',
      name: 'Uyo',
      address: '1 Ubi-Inyang Street, off Abak Road, Afaha Offot, Uyo',
      phone: '029382302',
      hours: 'Mon-Sat: 9am - 5pm',
      daysOpen: 'Monday - Saturday'
    }
  ]

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    country: 'NG',
    state: '',
    city: '',
    zip: ''
  })

  // Get cart data from store
  const cartItems = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const totalPrice = getCartTotal(cartItems)

  // Get Nigeria states and cities
  const nigeriaStates = State.getStatesOfCountry('NG')
  const selectedStateCities = City.getCitiesOfState('NG', formData.state)

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      price: deliveryPrices.standard,
      description: '4-6 business days',
      icon: <Truck className="mb-2 h-6 w-6"/>
    },
    {
      id: 'express',
      name: 'Express Delivery',
      price: deliveryPrices.express,
      description: '1-2 business days',
      icon: <Truck className="mb-2 h-6 w-6 animate-pulse"/>
    },
    {
      id: 'pickup',
      name: 'Pick Up',
      price: deliveryPrices.pickup,
      description: 'Collect from our centers',
      icon: <Store className="mb-2 h-6 w-6"/>
    }
  ]

  // Calculate shipping when location changes
  useEffect(() => {
    const calculateShipping = async () => {
      if (!formData.state || !formData.city) return
      
      setLoadingShipping(true)
      try {
        const response = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            state: formData.state,
            city: formData.city,
            deliveryMethod
          })
        })

        if (response.ok) {
          const data = await response.json()
          setShippingRates(data.rates)
          
          const newPrices = {}
          data.rates.forEach(rate => {
            newPrices[rate.method] = rate.price
          })
          // Pickup is always free
          newPrices.pickup = 0
          setDeliveryPrices(newPrices)

        }
      } catch (error) {
        console.error('Error calculating shipping:', error)
      } finally {
        setLoadingShipping(false)
      }
    }

    calculateShipping()
  }, [formData.state, formData.city, deliveryMethod])

  // Calculate total including delivery
  const selectedDelivery = deliveryOptions.find(opt => opt.id === deliveryMethod)
  const deliveryPrice = selectedDelivery?.price || 0
  const orderTotal = totalPrice + deliveryPrice

  // Get unique sections in cart
  const cartSections = [...new Set(cartItems.map(item => item.section))]
  const isCartEmpty = cartItems.length === 0

  // Check if selected wallet can be used with current cart
  const validateSelectedWallet = () => {
    if (isCartEmpty) {
      return {
        isValid: false,
        message: 'Cart is empty',
        canFund: false
      }
    }

    if (selectedWallet === 'cash') {
      return {
        isValid: wallets.wallets?.cash >= orderTotal,
        message: wallets.wallets?.cash >= orderTotal 
          ? 'Payment will use cash wallet'
          : 'Insufficient cash wallet balance',
        canFund: true
      }
    }

    const hasMixedSections = cartSections.length > 1
    const hasNonMatchingItems = cartSections.some(section => section !== selectedWallet)

    if (hasMixedSections || hasNonMatchingItems) {
      return {
        isValid: false,
        message: `Cannot use ${selectedWallet} wallet with mixed or non-${selectedWallet} items`,
        canFund: false
      }
    }

    return {
      isValid: wallets.wallets?.[selectedWallet] >= orderTotal,
      message: wallets.wallets?.[selectedWallet] >= orderTotal
        ? `Payment will use ${selectedWallet} wallet`
        : `Insufficient ${selectedWallet} wallet balance`,
      canFund: false
    }
  }

  // Auto-select appropriate wallet based on cart contents
  useEffect(() => {
    if (isCartEmpty) return

    if (cartSections.length > 1) {
      setSelectedWallet('cash')
      return
    }

    const currentSection = cartSections[0]
    const paymentValidation = validateSelectedWallet()
    
    if (!paymentValidation.isValid && selectedWallet !== 'cash') {
      if (wallets.wallets?.[currentSection] >= orderTotal) {
        setSelectedWallet(currentSection)
      } else {
        setSelectedWallet('cash')
      }
    }
  }, [cartItems, wallets, orderTotal])

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true)
      setError(null)

      // Validate cart
      if (isCartEmpty) {
        toast.error("Your cart is empty")
        return
      }

      // Validate form - for pickup, we don't need address but we need pickup center
      if (!formData.email || !formData.name) {
        toast.error("Name and email are required.")
        return
      }

      // For delivery methods, validate address
      if (deliveryMethod !== 'pickup' && (!formData.address || !formData.state || !formData.city || !formData.zip)) {
        toast.error("All address fields are required for delivery.")
        return
      }

      // For pickup, validate pickup center selection
      if (deliveryMethod === 'pickup' && !selectedPickupCenter) {
        toast.error("Please select a pickup center.")
        return
      }

      // Validate wallet payment
      const paymentValidation = validateSelectedWallet()
      if (!paymentValidation.isValid) {
        toast.error(paymentValidation.message)
        return
      }

      const orderData = {
        shippingInfo: {
          ...formData,
          ...(deliveryMethod === 'pickup' && {
            pickupCenter: selectedPickupCenter,
            pickupCenterName: pickupCenters.find(center => center.id === selectedPickupCenter)?.name,
            pickupCenterAddress: pickupCenters.find(center => center.id === selectedPickupCenter)?.address
          })
        },
        items: cartItems.map(item => ({
          product: item.id,
          name: item.name,
          price: item.discountedPrice || item.price,
          quantity: item.quantity,
          image: item.image,
          section: item.section,
          selectedVariants: item.selectedVariants
        })),
        deliveryMethod,
        deliveryPrice,
        subtotal: totalPrice,
        total: orderTotal,
        paymentMethod: selectedWallet === 'cash' 
          ? 'cash_wallet' 
          : `${selectedWallet}_wallet`,
        walletType: selectedWallet,
        ...(deliveryMethod === 'pickup' && { selectedPickupCenter })
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to place order')
      }

      const result = await response.json();
      clearCart()
      toast.success("Order placed successfully!")
      router.push(`/order-confirmation/${result.order._id}`)
      
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.')
      toast.error(err.message || 'Failed to place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Handle select changes
  const handleSelectChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Refresh wallet balance after funding
  const handleWalletFunded = async () => {
    try {
      setWalletLoading(true)
      const response = await fetch('/api/wallets', {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch wallets: ${response.status}`)
      }

      const data = await response.json()
      setWallets(data || {})
      setActiveModal(null)
      toast.success("Wallet funded successfully!")
    } catch (err) {
      console.error('Failed to fetch wallets:', err)
      toast.error("Failed to refresh wallet balance")
    } finally {
      setWalletLoading(false)
    }
  }

  // Set initial form values from session
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))
    }
  }, [session])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/checkout')
    }
  }, [status, router])

  // Fetch wallets
  useEffect(() => {
    if (status !== 'authenticated') return

    const fetchWallets = async () => {
      try {
        setWalletLoading(true)
        setError(null)
        
        const response = await fetch('/api/wallets', {
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch wallets: ${response.status}`)
        }

        const data = await response.json()
        setWallets(data || {})
      } catch (err) {
        console.error('Failed to fetch wallets:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setWalletLoading(false)
      }
    }

    fetchWallets()
  }, [status])

  // Redirect if cart is empty
  useEffect(() => {
    if (!isCartEmpty) return
    
    const timer = setTimeout(() => {
      router.push('/category')
    }, 2000)

    return () => clearTimeout(timer)
  }, [isCartEmpty, router])

  // Reset pickup center when delivery method changes
  useEffect(() => {
    if (deliveryMethod !== 'pickup') {
      setSelectedPickupCenter('')
    }
  }, [deliveryMethod])

  const paymentValidation = validateSelectedWallet()


  // Loading state
  if (status === 'loading' || walletLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="md:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isCartEmpty) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Redirecting you to the cart page...</p>
          <Button onClick={() => router.push('/cart')}>
            Go to Cart
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          <h2 className="font-bold">Error Loading Wallet Information</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {/* Only show address fields for delivery methods */}
              {deliveryMethod !== 'pickup' && (
                <>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required={deliveryMethod !== 'pickup'}
                    />
                  </div>
                  
                  {/* State Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(value) => handleSelectChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {nigeriaStates.map((state) => (
                          <SelectItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select 
                      value={formData.city} 
                      onValueChange={(value) => handleSelectChange('city', value)}
                      disabled={!formData.state}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.state ? "Select city" : "Select state first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedStateCities.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      placeholder="Enter your ZIP code"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required={deliveryMethod !== 'pickup'}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Delivery Method Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
              {loadingShipping && (
                <CardDescription>Calculating shipping rates...</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {deliveryOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                      deliveryMethod === option.id ? 'border-primary bg-primary/5' : ''
                    } ${
                      (option.id !== 'pickup' && (!formData.state || !formData.city)) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                    onClick={() => {
                      if (option.id === 'pickup' || (formData.state && formData.city)) {
                        setDeliveryMethod(option.id)
                      }
                    }}
                  >
                    <div className="mr-4">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{option.name}</h3>
                        <span className="font-medium">
                          {option.id === 'pickup' ? (
                            'Free'
                          ) : formData.state && formData.city ? (
                            `₦${formatPrice(option.price)}`
                          ) : (
                            'Select location'
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      
                      {deliveryMethod === 'pickup' && option.id === 'pickup' && (
                        <div className="mt-4 space-y-2">
                          <Label htmlFor="pickup-center">Choose a Pick-up Centre</Label>
                          <Select 
                            value={selectedPickupCenter} 
                            onValueChange={setSelectedPickupCenter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a pickup center" />
                            </SelectTrigger>
                            <SelectContent>
                              {pickupCenters.map((center) => (
                                <SelectItem key={center.id} value={center.id}>
                                  <div className="flex flex-col mt-10">
                                    <div className="font-medium">{center.name}</div>
                                    <div className="text-sm text-muted-foreground">{center.address}</div>
                                    <div className="text-xs text-muted-foreground mt-5">
                                      {center.hours} • {center.phone}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {/* Show selected center details */}
                          {selectedPickupCenter && (
                            <div className="p-5 bg-blue-50 rounded-lg mt-5">
                              <div className="flex items-start gap-3">
                                <Store className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {pickupCenters.find(center => center.id === selectedPickupCenter)?.name}
                                  </h4>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {pickupCenters.find(center => center.id === selectedPickupCenter)?.address}
                                  </p>
                                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-blue-600">
                                    <span>📞 {pickupCenters.find(center => center.id === selectedPickupCenter)?.phone}</span>
                                    <span>🕒 {pickupCenters.find(center => center.id === selectedPickupCenter)?.hours}</span>
                                  </div>
                                  <p className="text-xs text-blue-600 mt-1">
                                    Open: {pickupCenters.find(center => center.id === selectedPickupCenter)?.daysOpen}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Card */}
          <Card className="mt-8">
            <CardHeader 
              className={`cursor-pointer ${isPlacingOrder ? 'pointer-events-none' : ''}`} 
              onClick={() => !isPlacingOrder && setShowWallet(!showWallet)}
            >
              <div className="flex items-center justify-between">
                <CardTitle>Payment Method</CardTitle>
                <Button variant="ghost" size="icon" disabled={isPlacingOrder}>
                  {showWallet ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <CardDescription>
                {!showWallet && (
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{selectedWallet} wallet</span>
                    <span>•</span>
                    <span>₦{formatPrice(wallets.wallets?.[selectedWallet] || 0)}</span>
                    {!paymentValidation.isValid && (
                      <span className="text-red-500 text-sm">(Not available)</span>
                    )}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            {showWallet && (
              <CardContent>
                <div className="space-y-4">
                  {/* Cart Sections Info */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Cart contains: {cartSections.join(', ')} {cartSections.length > 1 && '(Mixed)'}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {cartSections.length > 1 
                        ? 'Mixed items can only be paid with cash wallet'
                        : `${cartSections[0]} items can be paid with ${cartSections[0]} wallet or cash wallet`}
                    </p>
                  </div>

                  {/* Wallet Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedWallet('cash')}
                      disabled={isPlacingOrder}
                      className={`p-3 border rounded-lg flex flex-col items-center transition-colors ${
                        selectedWallet === 'cash' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isPlacingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="p-2 rounded-full bg-primary/10 mb-2">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Cash</span>
                      <span className="text-xs text-muted-foreground mt-1">Any items</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedWallet('food')}
                      disabled={isPlacingOrder || cartSections.length > 1 || !cartSections.includes('food')}
                      className={`p-3 border rounded-lg flex flex-col items-center transition-colors ${
                        selectedWallet === 'food' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        (isPlacingOrder || cartSections.length > 1 || !cartSections.includes('food')) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      <div className="p-2 rounded-full bg-green-100 mb-2">
                        <Wallet className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">Food</span>
                      <span className="text-xs text-muted-foreground mt-1">Food only</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedWallet('gadget')}
                      disabled={isPlacingOrder || cartSections.length > 1 || !cartSections.includes('gadget')}
                      className={`p-3 border rounded-lg flex flex-col items-center transition-colors ${
                        selectedWallet === 'gadget' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        (isPlacingOrder || cartSections.length > 1 || !cartSections.includes('gadget')) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      <div className="p-2 rounded-full bg-blue-100 mb-2">
                        <Wallet className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">Gadget</span>
                      <span className="text-xs text-muted-foreground mt-1">Gadget only</span>
                    </button>
                  </div>

                  {/* Wallet Details */}
                  <div className={`p-4 border rounded-lg ${
                      selectedWallet === 'cash' ? 'bg-primary/5' : 
                      selectedWallet === 'food' ? 'bg-green-50' : 'bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          selectedWallet === 'cash' ? 'bg-primary/10' : 
                          selectedWallet === 'food' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <Wallet className={`h-5 w-5 ${
                            selectedWallet === 'cash' ? 'text-primary' : 
                            selectedWallet === 'food' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{selectedWallet} Wallet</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedWallet === 'cash' 
                              ? 'Pays for any products' 
                              : `Only for ${selectedWallet} products`}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">₦{formatPrice(wallets.wallets?.[selectedWallet] || 0)}</p>
                    </div>
                  </div>

                  {/* Validation Message */}
                  <div className={`p-3 rounded-lg flex items-start gap-2 ${
                      paymentValidation.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {!paymentValidation.isValid && (
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{paymentValidation.message}</p>
                      {!paymentValidation.isValid && paymentValidation.canFund && (
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-inherit mt-1"
                          onClick={() => setActiveModal('fund-cash')}
                        >
                          Add funds to cash wallet
                        </Button>
                      )}
                      {!paymentValidation.isValid && !paymentValidation.canFund && selectedWallet !== 'cash' && (
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-inherit mt-1"
                          onClick={() => setSelectedWallet('cash')}
                        >
                          Switch to cash wallet
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Order Summary Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${JSON.stringify(item.selectedVariants)}`} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ₦{formatPrice(item.discountedPrice || item.price)} × {item.quantity}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs capitalize">
                        {item.section}
                      </Badge>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(item.selectedVariants).map(([key, value]) => (
                            <span key={key} className="text-xs text-gray-500">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-sm">
                      ₦{formatPrice((item.discountedPrice || item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>₦{formatPrice(totalPrice)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Delivery</p>
                  <p>
                    {deliveryMethod === 'pickup' ? 'Free' : `₦${formatPrice(deliveryPrice)}`}
                  </p>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>₦{formatPrice(orderTotal)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!paymentValidation.isValid || isPlacingOrder || (deliveryMethod === 'pickup' && !selectedPickupCenter)}
                onClick={handlePlaceOrder}
              >
                {isPlacingOrder ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : paymentValidation.isValid ? 'Confirm Order' : 'Cannot Place Order'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Wallet Funding Modal */}
      {activeModal === 'fund-cash' && (
        <FundWalletModal
          walletType="cash"
          walletName="Cash Wallet"
          callbackUrl="/checkout"
          onClose={() => setActiveModal(null)}
          onSuccess={handleWalletFunded}
        />
      )}
    </div>
  )
}