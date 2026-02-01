import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/dbConnect"
import ShippingRate from "@/models/ShippingRate"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/options"

// GET all shipping rates
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const rates = await ShippingRate.find().sort({ isDefault: -1, state: 1, city: 1 })

    return NextResponse.json({
      success: true,
      rates
    })

  } catch (error) {
    console.error('Error fetching shipping rates:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST new shipping rate
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const body = await req.json()
    const { state, city, standard, express, isDefault } = body

    // Validate required fields
    if (!standard || !express) {
      return NextResponse.json(
        { error: "Standard and express prices are required" },
        { status: 400 }
      )
    }

    // For default rate, ensure no state/city is set
    if (isDefault && (state || city)) {
      return NextResponse.json(
        { error: "Default rate cannot have state or city specified" },
        { status: 400 }
      )
    }

    // For non-default rates, state is required
    if (!isDefault && !state) {
      return NextResponse.json(
        { error: "State is required for non-default rates" },
        { status: 400 }
      )
    }

    // Check for existing rate with same state/city combination
    const existingRate = await ShippingRate.findOne({
      state: state || null,
      city: city || null
    })

    if (existingRate) {
      return NextResponse.json(
        { error: "Shipping rate for this location already exists" },
        { status: 400 }
      )
    }

    // If setting new default, deactivate old default
    if (isDefault) {
      await ShippingRate.updateMany(
        { isDefault: true },
        { isDefault: false }
      )
    }

    const newRate = new ShippingRate({
      state: isDefault ? null : state,
      city: isDefault ? null : city,
      standard,
      express,
      isDefault
    })

    await newRate.save()

    return NextResponse.json({
      success: true,
      rate: newRate
    })

  } catch (error) {
    console.error('Error creating shipping rate:', error)
    return NextResponse.json(
      { error: "Internal server error" },
    )
}
}