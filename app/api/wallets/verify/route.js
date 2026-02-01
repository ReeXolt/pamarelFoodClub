import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import Transaction from '@/models/Transaction';

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const transaction_id = req.nextUrl.searchParams.get('transaction_id');
  const tx_ref = req.nextUrl.searchParams.get('tx_ref');
  const status = req.nextUrl.searchParams.get('status');

  if (!transaction_id || !tx_ref) {
    return NextResponse.json({ success: false, error: 'Missing transaction parameters' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const checkTrans = await Transaction.findOne({ flutterwaveTxRef: tx_ref });

    if (checkTrans.paymentStatus === "successful") {
      return NextResponse.json({ error: "payment already made" }, { status: 400 })
    }

    // Verify payment with Flutterwave
    const flutterwaveVerify = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await flutterwaveVerify.json();

    if (!result.status) {
      return NextResponse.json(
        { success: false, error: result.message || 'Verification failed' },
        { status: 400 }
      );
    }

    const paymentData = result.data;

    // Check if payment was successful
    if (paymentData.status === 'successful') {
      const amount = parseFloat(paymentData.amount);
      
      // Extract wallet info from tx_ref: wallet-fund-{timestamp}-{userId}-{walletType}
      const txRefParts = tx_ref.split('-');
      const userId = txRefParts[3];
      const walletType = txRefParts[4];

      // Verify user matches session
      if (userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized transaction' },
          { status: 403 }
        );
      }

      // Find user
      const user = await User.findById(userId);

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Update the appropriate wallet
      const currentBalance = user.earnings.cashWallet || 0;
      user.earnings.cashWallet = currentBalance + amount;
      await user.save();

      // Update transaction
      await Transaction.findOneAndUpdate(
        { flutterwaveTxRef: tx_ref },
        {
          status: 'successful',
          paymentStatus: 'successful',
          flutterwaveId: paymentData.id,
          paymentMethod: paymentData.payment_type,
          paidAt: new Date(paymentData.created_at),
          updatedAt: new Date(),
          flutterwaveResponse: result
        }
      );

      return NextResponse.json({
        success: true,
        amount,
        walletType: `${walletType}Wallet`,
        newBalance: user.earnings[`${walletType}Wallet`],
        reference: tx_ref,
      });
    } else {
      // Update transaction status to failed
      await Transaction.findOneAndUpdate(
        { flutterwaveTxRef: tx_ref },
        {
          status: 'failed',
          paymentStatus: 'failed',
          updatedAt: new Date(),
          flutterwaveResponse: result
        }
      );

      return NextResponse.json(
        { success: false, error: `Payment ${paymentData.status}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Flutterwave verify error:', error);
    
    // Update transaction status to failed on error
    const tx_ref = req.nextUrl.searchParams.get('tx_ref');
    if (tx_ref) {
      await Transaction.findOneAndUpdate(
        { flutterwaveTxRef: tx_ref },
        {
          status: 'failed',
          paymentStatus: 'failed',
          updatedAt: new Date()
        }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    );
  }
}