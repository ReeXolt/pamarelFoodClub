import { NextResponse } from 'next/server';
import User from '@/models/user';
import Order from '@/models/order';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/dbConnect';
import { authOptions } from '../../auth/options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDatabase();

    // Current period calculations (this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total members counts
    const totalMembers = await User.countDocuments();
    const membersWithoutPlan = await User.countDocuments({ currentPlan: null });

    // Revenue calculations
    const deliveredOrders = await Order.find({ 
      orderStatus: 'delivered',
      paymentStatus: 'paid'
    });

    const currentMonthOrders = await Order.find({
      orderStatus: 'delivered',
      paymentStatus: 'paid',
      createdAt: { $gte: startOfMonth }
    });

    const previousMonthOrders = await Order.find({
      orderStatus: 'delivered',
      paymentStatus: 'paid',
      createdAt: { 
        $gte: startOfPreviousMonth,
        $lte: endOfPreviousMonth
      }
    });

    // Calculate total revenue from all delivered orders
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

    // Calculate current month revenue
    const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + order.total, 0);

    // Calculate previous month revenue
    const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + order.total, 0);

    // Calculate revenue growth rate
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : currentMonthRevenue > 0 ? 100 : 0;

    // Member growth calculations
    const currentMonthMembers = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    const previousMonthMembers = await User.countDocuments({
      createdAt: { 
        $gte: startOfPreviousMonth,
        $lte: endOfPreviousMonth
      }
    });

    const membersGrowth = previousMonthMembers > 0
      ? ((currentMonthMembers - previousMonthMembers) / previousMonthMembers) * 100
      : currentMonthMembers > 0 ? 100 : 0;

    // Members without plan growth
    const currentMonthNoPlan = await User.countDocuments({
      currentPlan: null,
      createdAt: { $gte: startOfMonth }
    });

    const previousMonthNoPlan = await User.countDocuments({
      currentPlan: null,
      createdAt: { 
        $gte: startOfPreviousMonth,
        $lte: endOfPreviousMonth
      }
    });

    const noPlanGrowth = previousMonthNoPlan > 0
      ? ((currentMonthNoPlan - previousMonthNoPlan) / previousMonthNoPlan) * 100
      : currentMonthNoPlan > 0 ? 100 : 0;

    return NextResponse.json({
      totalMembers,
      membersWithoutPlan,
      totalRevenue,
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
      membersGrowth: parseFloat(membersGrowth.toFixed(1)),
      noPlanGrowth: parseFloat(noPlanGrowth.toFixed(1)),
      currentMonthRevenue,
      previousMonthRevenue
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}