import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";

export async function GET(request) {
  try {
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const planType = searchParams.get('planType');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build the query
    let query = {};
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Plan type filter (payment, wallet_funding, wallet_withdraw, etc.)
    if (planType && planType !== 'all') {
      query.planType = planType;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { flutterwaveTxRef: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { planName: { $regex: search, $options: 'i' } }
      ];
    }

    await connectToDatabase();
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(query);
    
    // Get transactions with pagination and populate user data
    const transactions = await Transaction.find(query)
      .populate('userId', 'username email name phone referralCode', User)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    // Format transactions for response
    const formattedTransactions = transactions.map(txn => ({
      _id: txn._id,
      transactionId: txn.transactionId,
      flutterwaveTxRef: txn.flutterwaveTxRef,
      flutterwaveId: txn.flutterwaveId,
      userId: txn.userId?._id || txn.userId,
      user: txn.userId ? {
        _id: txn.userId._id,
        username: txn.userId.username,
        email: txn.userId.email,
        name: txn.userId.name,
        phone: txn.userId.phone,
        referralCode: txn.userId.referralCode
      } : {
        email: txn.userEmail,
        name: txn.userName,
        phone: txn.userPhone
      },
      amount: txn.amount,
      currency: txn.currency || 'NGN',
      planType: txn.planType,
      planName: txn.planName,
      status: txn.status,
      paymentStatus: txn.paymentStatus,
      paymentMethod: txn.paymentMethod,
      createdAt: txn.createdAt,
      updatedAt: txn.updatedAt,
      paidAt: txn.paidAt,
      meta: txn.meta || {}
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    });
    
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions", details: error.message },
      { status: 500 }
    );
  }
}

