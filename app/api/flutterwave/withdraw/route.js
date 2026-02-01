export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";
import User from "@/models/user";
import connectToDatabase from "@/lib/dbConnect";
import BankAccount from '@/models/BankAccount';
import Transaction from '@/models/Transaction';

export async function POST(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const findUser = await User.findOne({ _id: session.user.id });

    if (!findUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (findUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "you are not authorized" }, { status: 403 });
    }

    const { amount, bankCode, accountNumber, accountName, saveAccount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
    }

    if (!bankCode || !accountNumber || !accountName) {
      return NextResponse.json({ success: false, error: "Bank details are required" }, { status: 400 });
    }

    // Check Flutterwave balance first
    const balanceResponse = await fetch("https://api.flutterwave.com/v3/balances", {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!balanceResponse.ok) {
      throw new Error("Failed to fetch Flutterwave balance");
    }

    const balanceData = await balanceResponse.json();
    const ngnWallet = balanceData?.data?.find(
      (wallet) => wallet.currency === "NGN"
    );

    if (!ngnWallet || ngnWallet.available_balance < amount) {
      return NextResponse.json({ 
        success: false, 
        error: "Insufficient balance in Flutterwave account" 
      }, { status: 400 });
    }

    // Get bank name
    const banksResponse = await fetch('https://api.flutterwave.com/v3/banks/NG', {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const banksData = await banksResponse.json();
    const bank = banksData.data?.find(b => b.code === bankCode);
    const bankName = bank ? bank.name : 'Unknown Bank';

    // Save bank account if requested
    if (saveAccount) {
      const existingAccount = await BankAccount.findOne({
        userId: session.user.id,
        accountNumber,
        bankCode
      });

      if (!existingAccount) {
        await BankAccount.create({
          userId: session.user.id,
          accountNumber,
          accountName,
          bankCode,
          bankName
        });
      }
    }

    // Initiate transfer with proxy service (same as wallet withdrawal)
    const transferResponse = await fetch('https://api.neondentalprosthetic.com/api/withdrawals', { // TODO: CHANGED THIS TO USE PAMAREL WHEN IT HAS PROPERGATE
      method: 'POST',
      headers: {
        'X-API-Key': process.env.FLUTTERWAVE_WITHDRAWAL_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        account_bank: bankCode,
        account_number: accountNumber,
        amount: amount,
        currency: 'NGN',
        narration: `Admin withdrawal from Flutterwave balance`
      })
    });

    const transferData = await transferResponse.json();


    if (transferData.status !== 'success') {
      return NextResponse.json({
        success: false,
        error: transferData.message || 'Withdrawal failed'
      }, { status: 400 });
    }

    const reference = transferData.data.reference;

    // Check the actual transfer status from the response
    // If the transfer was successfully initiated, mark as successful
    const transferStatus = transferData.data?.status?.toLowerCase() || '';
    const isSuccessful = transferData.status === 'success' && 
                        (transferStatus === 'successful' || transferStatus === 'new' || transferStatus === 'pending');

    // Create withdrawal transaction record
    const transaction = new Transaction({
      transactionId: reference,
      flutterwaveTxRef: reference,
      userId: findUser._id,
      userEmail: findUser.email,
      userName: findUser.name || findUser.username,
      userPhone: findUser.phone,
      amount: amount,
      currency: 'NGN',
      planType: 'flutterwave_withdraw',
      planName: 'Flutterwave Balance Withdrawal',
      status: isSuccessful ? 'successful' : 'pending',
      paymentStatus: isSuccessful ? 'successful' : 'pending',
      paymentMethod: 'bank_transfer',
      paidAt: isSuccessful ? new Date() : undefined,
      meta: {
        walletType: 'flutterwave',
        bankCode,
        bankName,
        accountNumber,
        accountName,
        transferId: reference,
        responseStatus: transferData.data.status,
        completeMessage: transferData.data.complete_message
      }
    });

    await transaction.save();

    return NextResponse.json({
      success: true,
      message: transferData.message,
      reference: reference,
      data: transferData.data
    });

  } catch (error) {
    console.error("Error processing Flutterwave withdrawal:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

