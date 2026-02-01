import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/dbConnect'
import mongoose from 'mongoose'
import Order from '@/models/order'
import Product from '@/models/product'
import User from '@/models/user'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/options'

export async function GET(request) { 
  try { 
    await connectToDatabase() 
    const session = await getServerSession(authOptions) 
    if (!session) { 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } 
      const { searchParams } = new URL(request.url) 
      const statusFilter = searchParams.get('status') || 'all' 
      let query = { user: session.user.id } 
      if (statusFilter !== 'all') 
        query.orderStatus = statusFilter 
      const orders = await Order.find(query) .sort({ createdAt: -1 }) .populate('items.product') 
      return NextResponse.json(orders) 
    } catch (error) { 
      console.error("Error fetching orders:", error) 
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 }) 
    } 
}

export async function POST(req) {
  await connectToDatabase()
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    shippingInfo,
    items,
    deliveryMethod,
    deliveryPrice,
    subtotal,
    total,
    paymentMethod,
    selectedPickupCenter,
    walletType
  } = body

  // Start MongoDB session
  const mongoSession = await mongoose.startSession()

  let createdOrder = null

  try {
    await mongoSession.withTransaction(async () => {
      
      // 1️⃣ Validate products
      for (const item of items) {
        const product = await Product.findById(item.product).session(mongoSession)
        if (!product) throw new Error(`Product not found: ${item.name}`)

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          )
        }
      }

      // 2️⃣ Load user + wallet checks
      const user = await User.findById(session.user.id).session(mongoSession)
      if (!user) throw new Error('User not found')

      // Wallet validation based on walletType from frontend
      if (walletType === 'cash') {
        if ((user?.earnings?.cashWallet ?? 0) < total)
          throw new Error('Insufficient cash wallet')
        user.earnings.cashWallet -= total
      } else if (walletType === 'food') {
        if ((user?.earnings?.foodWallet ?? 0) < total)
          throw new Error('Insufficient food wallet')
        user.earnings.foodWallet -= total
      } else if (walletType === 'gadget') {
        if ((user?.earnings?.gadgetsWallet ?? 0) < total)
          throw new Error('Insufficient gadget wallet')
        user.earnings.gadgetsWallet -= total
      }

      await user.save({ session: mongoSession })

      // 3️⃣ Build order with pickup information
      const orderItems = items.map((item) => ({
        product: item.product,
        name: item.name,
        price: item.price || item.sellingPrice || item.discountedPrice,
        quantity: item.quantity,
        imageUrl: item.image || item.imageUrl,
        selectedVariants: item.selectedVariants || {},
        variantSku: item.variantSku || '',
      }))

      // Prepare order data with pickup info
      const orderData = {
        user: session.user.id,
        items: orderItems,
        deliveryMethod,
        deliveryPrice,
        subtotal,
        total,
        paymentMethod,
        paymentStatus: 'paid',
        orderStatus: 'processing',
        walletBalanceUsed: ['cash_wallet', 'food_wallet', 'gadget_wallet'].includes(paymentMethod)
          ? total
          : 0,
      }

      // Add shipping info or pickup info based on delivery method
      if (deliveryMethod === 'pickup') {
        orderData.pickupInfo = {
          centerId: selectedPickupCenter,
          centerName: shippingInfo.pickupCenterName,
          centerAddress: shippingInfo.pickupCenterAddress,
          phone: getPickupCenterPhone(selectedPickupCenter),
          hours: 'Mon-Sat: 9am - 5pm',
          daysOpen: 'Monday - Saturday'
        }
        // For pickup orders, we still store basic customer info but not full address
        orderData.shippingInfo = {
          name: shippingInfo.name,
          email: shippingInfo.email,
          // No address required for pickup
        }
      } else {
        // For delivery orders, store full shipping info
        orderData.shippingInfo = shippingInfo
      }

      // 4️⃣ Create order
      const orderDocs = await Order.create(
        [orderData],
        { session: mongoSession }
      )

      createdOrder = orderDocs[0]

      // 5️⃣ Deduct stock
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: -item.quantity,
              numberSold: item.quantity,
            },
          },
          { session: mongoSession }
        )
      }
    })

    mongoSession.endSession()

    // 6️⃣ Return order to frontend
    return NextResponse.json(
      { message: 'Order created successfully', order: createdOrder },
      { status: 201 }
    )

  } catch (error) {
    console.error('Order creation error:', error)
    await mongoSession.abortTransaction()
    mongoSession.endSession()

    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get pickup center phone
function getPickupCenterPhone(centerId) {
  const centers = {
    'warri': '0920203',
    'uyo': '029382302'
  }
  return centers[centerId] || 'Not available'
}
