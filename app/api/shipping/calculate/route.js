import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/dbConnect"
import ShippingRate from "@/models/ShippingRate"

export async function POST(req) {
  try {
    await connectToDatabase()

    const { state, city, deliveryMethod = 'standard' } = await req.json()

    if (!state) {
      return NextResponse.json(
        { error: "State is required" },
        { status: 400 }
      )
    }

    // Find specific rate for city first, then state, then fallback to default
    let shippingRate = await ShippingRate.findOne({
      $or: [
        { state, city }, // Exact match for state and city
        { state, city: null }, // State-wide rate
        { state: null, city: null, isDefault: true } // Default rate
      ]
    }).sort({ city: -1, state: -1 }) // Prefer city-specific over state-wide over default


    if (!shippingRate) {
      // If no rates found, use a safe default
      shippingRate = {
        standard: 1500,
        express: 3000
      }
    }

    const rates = [
      {
        method: 'standard',
        price: shippingRate.standard,
        description: '4-6 business days'
      },
      {
        method: 'express',
        price: shippingRate.express,
        description: '1-2 business days'
      }
    ]

    return NextResponse.json({
      success: true,
      rates,
      location: { state, city }
    })

  } catch (error) {
    console.error('Error calculating shipping:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}