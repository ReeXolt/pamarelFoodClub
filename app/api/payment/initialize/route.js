import { NextResponse } from 'next/server';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';
import User from '@/models/user'; // Import User model to get user data

export async function POST(request) {
  try {
    const { email, amount, planType, userId, planName, phone, name } = await request.json();
    
    if (!email || !amount || !planType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique transaction reference
    const tx_ref = `pamarel-${Date.now()}-${userId}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get user data to ensure we have email
    let userEmail = email;
    let userName = name || 'Customer';
    let userPhone = phone || '';

    // If you want to fetch user data from database for verification
    try {
      const user = await User.findById(userId);
      if (user) {
        userEmail = user.email || email;
        userName = user.name || name || 'Customer';
        userPhone = user.phone || phone || '';
      }
    } catch (userError) {
      // Continue with provided data
    }

    // Create transaction record in database first
    const transaction = new Transaction({
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      flutterwaveTxRef: tx_ref,
      userId: new mongoose.Types.ObjectId(userId),
      userEmail: userEmail, // Make sure this is provided
      userName: userName,
      userPhone: userPhone,
      amount: amount,
      currency: 'NGN',
      planType: planType,
      planName: planName || getPlanName(planType),
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Save transaction to database
    await transaction.save();
    
    // Prepare Flutterwave payload
    const payload = {
      tx_ref,
      amount: amount.toString(),
      currency: 'NGN',
      payment_options: 'card, banktransfer, ussd',
      redirect_url: `${process.env.NEXTAUTH_URL}/payment/verify?tx_ref=${tx_ref}`,
      customer: {
        email: userEmail,
        name: userName,
        phonenumber: userPhone
      },
      customizations: {
        title: 'Pamarel Investment',
        description: `Payment for ${planName} Plan`,
        logo: `${process.env.NEXTAUTH_URL}/pamarel-logo.jpeg`
      },
      meta: {
        planType,
        userId,
        planName,
        transactionId: transaction.transactionId
      }
    };

    // Initialize Flutterwave payment
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Flutterwave error:', errorData);
      
      // Update transaction status to failed
      await Transaction.findOneAndUpdate(
        { transactionId: transaction.transactionId },
        {
          status: 'failed',
          paymentStatus: 'failed',
          updatedAt: new Date(),
          flutterwaveResponse: errorData
        }
      );
      
      throw new Error(errorData.message || 'Failed to initialize payment');
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      checkoutLink: data.data.link,
      paymentUrl: data.data.link,
      reference: tx_ref,
      transactionId: transaction.transactionId
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}

// Helper function to get plan name
function getPlanName(planType) {
  const planNames = {
    basic: 'BASIC FOOD PLAN',
    classic: 'CLASSIC FOOD PLAN', 
    deluxe: 'DELUXE FOOD PLAN'
  };
  return planNames[planType] || 'Unknown Plan';
}