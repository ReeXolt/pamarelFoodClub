import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
import { NextResponse } from 'next/server';
import User from '@/models/user';
import connectToDatabase from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { amount, walletType } = await req.json();

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount. Must be a positive number' },
        { status: 400 }
      );
    }

    // Validate wallet type
    const validWalletTypes = ['cash', 'gadget', 'food'];
    if (!validWalletTypes.includes(walletType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet type' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate unique transaction reference
    const tx_ref = `wallet-fund-${Date.now()}-${user._id}-${walletType}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    const transaction = new Transaction({
      transactionId: `WALLET_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      flutterwaveTxRef: tx_ref,
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      userPhone: user.phone,
      amount: parseFloat(amount),
      currency: 'NGN',
      planType: 'wallet_funding', // Special type for wallet funding
      planName: `${walletType.toUpperCase()} Wallet Funding`,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Save transaction to database
    await transaction.save();

    // Prepare Flutterwave payload
    const payload = {
      tx_ref,
      amount: amount.toString(), // Flutterwave expects string
      currency: 'NGN',
      payment_options: 'card, banktransfer, ussd, mobilemoney',
      redirect_url: `${process.env.NEXTAUTH_URL}/wallet/verify`,
      customer: {
        email: user.email,
        name: user.name || 'Customer',
        phonenumber: user.phone || ''
      },
      customizations: {
        title: 'Pamarel Investment',
        description: `Funding ${walletType} wallet`,
        logo: `${process.env.NEXTAUTH_URL}/pamarel-logo.jpeg`

      },
      meta: {
        walletType,
        userId: user._id.toString(),
        purpose: 'wallet_funding',
        transactionId: transaction.transactionId // Include our internal transaction ID
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
      message: 'Payment initialized successfully',
      paymentUrl: data.data.link,
      checkoutLink: data.data.link,
      reference: tx_ref,
      transactionId: transaction.transactionId
    });

  } catch (error) {
    console.error('Flutterwave funding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}